import URLFetchRequestOptions = GoogleAppsScript.URL_Fetch.URLFetchRequestOptions;
import HTTPResponse = GoogleAppsScript.URL_Fetch.HTTPResponse;

import { API } from '../common/API';

namespace URL {
  export const HOST = 'https://app.splatoon2.nintendo.net';
  export const BASE = HOST + '/api';
  export const RESULTS = BASE + '/results';
  export const REPORT_ABUSE = BASE + '/report_abuse';
}

export class SplatNet2API extends API {
  static getResultsUrl(): string {
    return URL.RESULTS;
  }

  static getResultUrl(battleNumber: number): string {
    return URL.RESULTS + '/' + battleNumber.toString();
  }

  static getReportAbuseUrl(): string {
    return URL.REPORT_ABUSE;
  }

  private readonly iksmSession: string;

  constructor(iksmSession: string) {
    super();
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

  private postAPI(url: string, payload: object): HTTPResponse {
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

  public getResults(): HTTPResponse {
    return this.getAPI(SplatNet2API.getResultsUrl());
  }

  public getResult(battleNumber: number): HTTPResponse {
    return this.getAPI(SplatNet2API.getResultUrl(battleNumber));
  }

  public postReportAbuse(result: any, player: any, reasonCode: string, text: string): HTTPResponse {
    const payload = {
      battle_number: result.battle_number,
      reportee_nsa_id: player.principal_id,
      battle_time: result.start_time,
      text: text,
      reason_code: reasonCode
    };
    return this.postAPI(SplatNet2API.getReportAbuseUrl(), payload);
  }
}
