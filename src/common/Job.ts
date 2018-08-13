export class Job {
  protected static readonly PROPERTIES = PropertiesService.getScriptProperties();

  protected readonly lockKey: string;

  constructor(lockKey: string) {
    this.lockKey = lockKey;
  }

  private lock(): boolean {
    const lock = Job.PROPERTIES.getProperty(this.lockKey);
    if (lock !== null) {
      console.error(Utilities.formatString('%s: Lock failed.', this.lockKey));
      return false;
    }

    Job.PROPERTIES.setProperty(this.lockKey, Date.now().toString());
    return true;
  }

  private unlock() {
    Job.PROPERTIES.deleteProperty(this.lockKey);
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
