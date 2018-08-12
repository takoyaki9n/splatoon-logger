import Folder = GoogleAppsScript.Drive.Folder;
import Properties = GoogleAppsScript.Properties.Properties;
import HTTPResponse = GoogleAppsScript.URL_Fetch.HTTPResponse;

import { Utils } from './Utils';
import { API } from './API';
import { PropetyKeys } from './PropetyKeys';

export class JobManager {
  private static readonly RESULTS_FOLDER_NAME = 'results';
  private static readonly MAX_RESULTS_COUNT = 50;
  private static readonly RESON_CODE_DISCONNECTION = 'playing_frequent_disconnection';
  private static readonly TEXT_DISCONNECTION = '通信切断';

  private readonly root: Folder;
  private readonly properties: Properties;
  private readonly api: API;
  private readonly resultFolder: Folder;

  constructor() {
    this.root = Utils.getScriptFolder();
    this.properties = PropertiesService.getScriptProperties();
    const iksmSession = this.properties.getProperty(PropetyKeys.IKSM_SESSION);
    this.api = new API(iksmSession);
    this.resultFolder = Utils.getFolder(this.root, JobManager.RESULTS_FOLDER_NAME);
  }

  private lock(): boolean {
    const lock = this.properties.getProperty(PropetyKeys.LOCK);
    if (lock !== null) return Utils.withLog(false, 'Lock failed.');

    this.properties.setProperty(PropetyKeys.LOCK, Date.now().toString());
    return true;
  }

  private unlock() {
    this.properties.deleteProperty(PropetyKeys.LOCK);
  }

  private getLocalLatestBattleNumber(): number {
    const latest = this.properties.getProperty(PropetyKeys.LATEST);
    var battleNumber = Number(latest);
    if (latest === null || isNaN(battleNumber))
      throw new Error(Utilities.formatString('Property latest is invalid: %s', latest));

    return battleNumber;
  }

  private getRemoteLatestBattleNumber(): number {
    const response = this.api.getResults();
    const responseData = JSON.parse(response.getContentText('UTF-8'));
    const results: Array<any> = responseData.results;
    results.sort((a, b) => {
      return b.battle_number - a.battle_number;
    });
    return Number(results[0].battle_number);
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
        JobManager.RESON_CODE_DISCONNECTION,
        JobManager.TEXT_DISCONNECTION
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

  private saveResult(response: HTTPResponse, battleNumber): void {
    if (response.getResponseCode() !== 200) return;

    const name = battleNumber.toString();
    const file = this.resultFolder.createFile(name, response.getContentText('UTF-8'));
    if (file === null) throw new Error('Failed to save result.');

    this.properties.setProperty(PropetyKeys.LATEST, name);
    console.log(Utilities.formatString('Result %d is saved.', battleNumber));
  }

  private run(fun: () => void): void {
    if (!this.lock()) return;
    try {
      fun();
    } catch (error) {
      console.error(JSON.stringify(error));
    }
    this.unlock();
  }

  public downloadResult(): void {
    this.run(() => {
      const remote = this.getRemoteLatestBattleNumber();
      const local = this.getLocalLatestBattleNumber();

      if (remote === local) return Utils.withLog(null, 'Already up-to-date.');

      if (remote - local > JobManager.MAX_RESULTS_COUNT)
        return Utils.withLog<null>(null, 'Old results seemed to be lost...');

      const battleNumber = local + 1;
      const response = this.api.getResult(battleNumber);
      this.saveResult(response, battleNumber);
      this.reportDisconnection(response);
    });
  }
}
