import Properties = GoogleAppsScript.Properties.Properties;

export class PropertyManager {
  private readonly id: string;
  private readonly properties: Properties;

  constructor(id: string) {
    this.id = id
    this.properties = PropertiesService.getScriptProperties();
  }

  public getKey(key:string) :string {
      return Utilities.formatString('%s-%s', this.id, key);
  }

  public getProperty(key: string): string {
      return this.properties.getProperty(this.getKey(key));
  }

  public setProperty(key: string, value: string): Properties {
      return this.properties.setProperty(this.getKey(key), value);
  }

  public deleteProperty(key: string): Properties {
      return this.properties.deleteProperty(this.getKey(key));
  }
}
