import Folder = GoogleAppsScript.Drive.Folder;
import { JobManager } from './JobManager';
import { API } from './API';
import { PropetyKeys } from './PropetyKeys';

declare var global: any;

global.testAPI = () => {
  const prop = PropertiesService.getScriptProperties();
  const api = new API(prop.getProperty(PropetyKeys.IKSM_SESSION));
  const response = api.getResults();
  Logger.log(response.getContentText('UTF-8'));
};

global.main = (): void => {
  const jobManager = new JobManager();
  jobManager.downloadResult();
};
