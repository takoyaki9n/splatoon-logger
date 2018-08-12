import {PropertyManager} from './PropertyManager';
import {Utils} from './Utils';

namespace PropetyKeys {
  export const LOCK = 'lock'
}

export class Job {
  protected readonly jobId: string;
  protected readonly propertyManager: PropertyManager;

  constructor(jobId: string) {
    this.jobId = jobId
    this.propertyManager = new PropertyManager(this.jobId);
  }

  private lock(): boolean {
    const lock = this.propertyManager.getProperty(PropetyKeys.LOCK);
    if (lock !== null) return Utils.withLog(false, Utilities.formatString('%s: Lock failed.', this.jobId));

    this.propertyManager.setProperty(PropetyKeys.LOCK, Date.now().toString());
    return true;
  }

  private unlock() {
    this.propertyManager.deleteProperty(PropetyKeys.LOCK);
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
