import Folder = GoogleAppsScript.Drive.Folder;
import HTTPResponse = GoogleAppsScript.URL_Fetch.HTTPResponse;

import { Job } from '../common/Job';
import { Utils } from '../common/Utils';
import { SplatNet2API } from './SplatNet2API';

namespace PropetyKeys {
  export const LOCK = 'splatnet2_lock';
  export const IKSM_SESSION = 'iksm_session';
  export const LATEST = 'latest';
  export const REPORT_ENABLED = 'report_enabled';
}

namespace Abuse {
  export const DISCONNECTION = {
    REASON_CODE: 'playing_frequent_disconnection',
    TEXT: '通信切断'
  };
}

export class SplatNet2Job extends Job {
  private static readonly RESULTS_FOLDER_NAME = 'results';
  private static readonly RESULT_MARGIN = 10;

  public static runPullNextResult(): void {
    const job = new SplatNet2Job();
    job.transaction(() => {
      job.pullNextResult();
    });
  }

  public static getLatestBattleNumber(): number {
    const value = Job.PROPERTIES.getProperty(PropetyKeys.LATEST);
    var battleNumber = Number(value);
    if (value === null || isNaN(battleNumber)) {
      const message = Utilities.formatString(
        'Property %s is invalid: %s',
        PropetyKeys.LATEST,
        value
      );
      console.error(message);
      return 0;
    }

    return battleNumber;
  }

  private readonly api: SplatNet2API;
  private readonly resultFolder: Folder;

  constructor() {
    super(PropetyKeys.LOCK);
    const iksmSession = Job.PROPERTIES.getProperty(PropetyKeys.IKSM_SESSION);
    if (iksmSession === null)
      throw new Error(Utilities.formatString('%s is not set.', PropetyKeys.IKSM_SESSION));
    this.api = new SplatNet2API(iksmSession);
    const root = Utils.getScriptFolder();
    this.resultFolder = Utils.getFolder(root, SplatNet2Job.RESULTS_FOLDER_NAME);
  }

  private getBattleNumbers(): number[] {
    const response = this.api.getResults();
    const responseData = JSON.parse(response.getContentText('UTF-8'));
    const results: any[] = responseData.results;
    const battleNumbers: Array<number> = results
      .map(result => {
        return result.battle_number;
      })
      .sort();

    return battleNumbers;
  }

  private reportDisconnection(response: HTTPResponse): void {
    const reportEnabled = Job.PROPERTIES.getProperty(PropetyKeys.REPORT_ENABLED);
    if (reportEnabled !== 'true') return;

    const result = JSON.parse(response.getContentText('UTF-8'));
    const members: Array<any> = result.my_team_members.concat(result.other_team_members);
    const reportee = members.filter(member => {
      return member.game_paint_point === 0;
    });
    reportee.forEach(member => {
      const reportResponse = this.api.postReportAbuse(
        result,
        member.player,
        Abuse.DISCONNECTION.REASON_CODE,
        Abuse.DISCONNECTION.TEXT
      );
      if (reportResponse.getResponseCode() === 204) {
        const message = Utilities.formatString(
          'Disconnection reported: buttle_number=%s, nickname=%s',
          result.battle_number,
          member.player.nickname
        );
        console.log(message);
      }
    });
  }

  private saveResult(response: HTTPResponse, battleNumber: number): void {
    const name = battleNumber.toString();
    const file = this.resultFolder.createFile(name, response.getContentText('UTF-8'));
    if (file === null)
      throw new Error(Utilities.formatString('Failed to save result %d.', battleNumber));

    Job.PROPERTIES.setProperty(PropetyKeys.LATEST, name);
    const message = Utilities.formatString('Result %d is saved.', battleNumber);
    console.log(message);
  }

  private pullNextResult(): void {
    const latest = SplatNet2Job.getLatestBattleNumber();
    const battleNumbers = this.getBattleNumbers();
    const nextIndex = Utils.upperBound(battleNumbers, latest);
    const next = battleNumbers[nextIndex];

    if (battleNumbers.length <= nextIndex) return;

    if (battleNumbers[0] > latest + 1) {
      const message = Utilities.formatString(
        'WARN: Results %d to %d have been expired.',
        latest + 1,
        battleNumbers[0] - 1
      );
      console.warn(message);
    } else if (nextIndex < SplatNet2Job.RESULT_MARGIN) {
      const message = Utilities.formatString(
        'WARN: Result %d will expire in %d games.',
        next,
        nextIndex + 1
      );
      console.warn(message);
    }

    if (next > latest + 1) {
      const message = Utilities.formatString(
        'WARN: Results %d to %d are skipped.',
        latest + 1,
        next - 1
      );
      console.warn(message);
    }

    const response = this.api.getResult(next);
    this.saveResult(response, next);
    this.reportDisconnection(response);
  }
}
