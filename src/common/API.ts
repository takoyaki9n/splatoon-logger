export class API {
  static getFormatedCookie(cookies: Object) {
    var kvs = [];
    for (const key in cookies) {
      kvs.push(Utilities.formatString('%s=%s', key, cookies[key]));
    }
    return kvs.join('; ');
  }
}
