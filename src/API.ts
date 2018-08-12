import URLFetchRequestOptions = GoogleAppsScript.URL_Fetch.URLFetchRequestOptions;
import HTTPResponse = GoogleAppsScript.URL_Fetch.HTTPResponse;

export class API {
  private static readonly HOST_URL = 'https://app.splatoon2.nintendo.net';
  private static readonly BASE_URL = API.HOST_URL + '/api';
  private static readonly RESULTS_URL = API.BASE_URL + '/results';
  private static readonly REPORT_ABUSE_URL = API.BASE_URL + '/report_abuse';

  static getResultsUrl(): string {
    return API.RESULTS_URL;
  }

  static getResultUrl(battleNumber: number): string {
    return API.RESULTS_URL + '/' + battleNumber.toString();
  }

  static getReportAbuseUrl(): string {
    return API.REPORT_ABUSE_URL;
  }

  static getFormatedCookie(cookies: Object) {
    var kvs = [];
    for (const key in cookies) {
      kvs.push(Utilities.formatString('%s=%s', key, cookies[key]));
    }
    return kvs.join('; ');
  }

  private readonly iksmSession: string;

  constructor(iksmSession: string) {
    this.iksmSession = iksmSession;
  }

  private getAPI(url: string): HTTPResponse {
    const cookies = { iksm_session: this.iksmSession };
    const headers = { Cookie: API.getFormatedCookie(cookies) };
    const params: URLFetchRequestOptions = {
      method: 'get',
      headers: headers
    };
    return UrlFetchApp.fetch(url, params);
  }

  public getResults(): HTTPResponse {
    return this.getAPI(API.getResultsUrl());
  }

  public getResult(battleNumber: number): HTTPResponse {
    return this.getAPI(API.getResultUrl(battleNumber));
  }

  private postAPI(url: string, payload: Object): HTTPResponse {
    const cookies = { iksm_session: this.iksmSession };
    const headers = {
      Cookie: API.getFormatedCookie(cookies),
      'x-requested-with': 'XMLHttpRequest'
    };
    const params: URLFetchRequestOptions = {
      method: 'post',
      headers: headers,
      payload: payload
    };
    return UrlFetchApp.fetch(url, params);
  }

  public postReportAbuse(result: any, player: any, reasonCode: string, text: string): HTTPResponse {
    const payload = {
      battle_number: result.battle_number,
      reportee_nsa_id: player.principal_id,
      battle_time: result.start_time,
      text: text,
      reason_code: reasonCode
    };
    return this.postAPI(API.getReportAbuseUrl(), payload);
  }
}
