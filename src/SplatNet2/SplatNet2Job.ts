import Folder = GoogleAppsScript.Drive.Folder;
import Properties = GoogleAppsScript.Properties.Properties;
import HTTPResponse = GoogleAppsScript.URL_Fetch.HTTPResponse;

import { GASJob } from '../common/GASJob';
import { Utils } from '../common/Utils';
import { SplatNet2API } from './SplatNet2API';

namespace PropetyKeys {
  export const IKSM_SESSION = 'iksm_session';
  export const LATEST = 'latest';
}

namespace Abuse {
  export const DISCONNECTION = {
    REASON_CODE: 'playing_frequent_disconnection',
    TEXT: '通信切断'
  };
}

export class SplatNet2Job extends GASJob {
  protected static readonly JOB_ID = 'SplatNet2';

  private static readonly RESULTS_FOLDER_NAME = 'results';
  private static readonly RESULT_MARGIN = 10;

  public static runPullNextResult(): void {
    const job = new SplatNet2Job();
    job.transaction(() => {
      job.pullNextResult();
    });
  }

  private readonly api: SplatNet2API;
  private readonly root: Folder;
  private readonly resultFolder: Folder;

  constructor() {
    super(SplatNet2Job.JOB_ID);
    this.root = Utils.getScriptFolder();
    const iksmSession = this.propertyManager.getProperty(PropetyKeys.IKSM_SESSION);
    if (iksmSession === null) throw new Error(this.logEntry('iksm_session is not set.'));
    this.api = new SplatNet2API(iksmSession);
    this.resultFolder = Utils.getFolder(this.root, SplatNet2Job.RESULTS_FOLDER_NAME);
  }

  private getLocalLatestBattleNumber(): number {
    const latest = this.propertyManager.getProperty(PropetyKeys.LATEST);
    var battleNumber = Number(latest);
    if (latest === null || isNaN(battleNumber)) {
      console.error(this.logEntry('Property latest is invalid: ' + latest));
      return 0;
    }

    return battleNumber;
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

  private reportDisconnection(response: HTTPResponse) {
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
        console.log(this.logEntry(message));
      }
    });
  }

  private saveResult(response: HTTPResponse, battleNumber: number): void {
    const name = battleNumber.toString();
    const file = this.resultFolder.createFile(name, response.getContentText('UTF-8'));
    if (file === null) throw new Error('Failed to save result.');

    this.propertyManager.setProperty(PropetyKeys.LATEST, name);
    console.log(Utilities.formatString('Result %d is saved.', battleNumber));
  }

  private pullNextResult(): void {
    const battleNumbers = this.getBattleNumbers();
    const local = this.getLocalLatestBattleNumber();
    const nextIndex = Utils.upperBound(battleNumbers, local);
    const next = battleNumbers[nextIndex];

    if (battleNumbers.length <= nextIndex)
      return Utils.withLog(null, this.logEntry('Already up-to-date.'));

    if (battleNumbers[0] > local + 1) {
      const message = Utilities.formatString(
        'WARN: Results %d to %d have been expired.',
        local + 1,
        battleNumbers[0] - 1
      );
      console.warn(this.logEntry(message));
    } else if (nextIndex < SplatNet2Job.RESULT_MARGIN) {
      const message = Utilities.formatString(
        'WARN: Result %d will expire in %d games.',
        next,
        nextIndex + 1
      );
      console.warn(this.logEntry(message));
    }

    if (next > local + 1) {
      const message = Utilities.formatString(
        'WARN: Results %d to %d are skipped.',
        local + 1,
        next - 1
      );
      console.warn(this.logEntry(message));
    }

    const response = this.api.getResult(next);
    this.saveResult(response, next);
    this.reportDisconnection(response);
  }
}
