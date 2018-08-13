import Properties = GoogleAppsScript.Properties.Properties;

export class GASJob {
  protected readonly lockKey: string;
  protected readonly properties: Properties;

  constructor(lockKey: string) {
    this.lockKey = lockKey;
    this.properties = PropertiesService.getScriptProperties();
  }

  private lock(): boolean {
    const lock = this.properties.getProperty(this.lockKey);
    if (lock !== null) {
      console.error(Utilities.formatString('%s: Lock failed.', this.lockKey));
      return false;
    }

    this.properties.setProperty(this.lockKey, Date.now().toString());
    return true;
  }

  private unlock() {
    this.properties.deleteProperty(this.lockKey);
  }

  protected transaction(fun: () => void): void {
    if (!this.lock()) return;
    try {
      fun();
    } catch (error) {
      console.error(JSON.stringify(error));
    }
    this.unlock();
  }
}
