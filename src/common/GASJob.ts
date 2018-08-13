import { PropertyManager } from './PropertyManager';
import { Utils } from './Utils';

namespace PropetyKeys {
  export const LOCK = 'lock';
}

export class GASJob {
  protected readonly jobId: string;
  protected readonly propertyManager: PropertyManager;

  constructor(jobId: string) {
    this.jobId = jobId;
    this.propertyManager = new PropertyManager(this.jobId);
  }

  private lock(): boolean {
    const lock = this.propertyManager.getProperty(PropetyKeys.LOCK);
    if (lock !== null) {
      console.error(this.logEntry('Lock failed.'));
      return false;
    }

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

  protected logEntry(message: string) {
    return Utilities.formatString('%s: %s', this.jobId, message);
  }
}
