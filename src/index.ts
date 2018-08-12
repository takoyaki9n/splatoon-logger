import URLFetchRequestOptions = GoogleAppsScript.URL_Fetch.URLFetchRequestOptions;

declare var global: any;

global.main = (): void => {
  const url = 'http://httpbin.org/get';
  const params: URLFetchRequestOptions = {
    method: 'get'
  };
  const response = UrlFetchApp.fetch(url, params);
  Logger.log(response.getContentText('UTF-8'));
};
