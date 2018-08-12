import Folder = GoogleAppsScript.Drive.Folder;
import File = GoogleAppsScript.Drive.File;
import FileIterator = GoogleAppsScript.Drive.FileIterator;
import FolderIterator = GoogleAppsScript.Drive.FolderIterator;

export class Utils {
  public static getScriptFolder(): Folder {
    const scriptId = ScriptApp.getScriptId();
    const file = DriveApp.getFileById(scriptId);
    const folders = file.getParents();
    while (folders.hasNext()) return folders.next();
    return null;
  }

  public static getFolder(folder: Folder, folderName: string): Folder {
    const folders = folder.getFoldersByName(folderName);
    while (folders.hasNext()) return folders.next();
    return null;
  }

  public static getFile(folder: Folder, fileName: string): File {
    const files = folder.getFilesByName(fileName);
    while (files.hasNext()) return files.next();
    return null;
  }

  public static getFileContentText(file: File): string {
    return file != null ? file.getBlob().getDataAsString() : '';
  }

  public static forEach(
    iterator: FileIterator | FolderIterator,
    fun: (item: File | Folder) => void
  ): void {
    while (iterator.hasNext()) fun(iterator.next());
  }

  public static withLog<T>(v: T, message?: any) {
    console.log(message);
    return v;
  }

  public static lowerBound(arr: number[], n: number): number {
    var l = 0,
      r = arr.length - 1;
    while (l <= r) {
      const m = 0 | ((l + r) / 2);
      if (arr[m] < n) l = m + 1;
      else r = m - 1;
    }
    return l;
  }

  public static upperBound(arr: number[], n: number) {
    var l = 0,
      r = arr.length - 1;
    while (l <= r) {
      const m = 0 | ((l + r) / 2);
      if (arr[m] <= n) l = m + 1;
      else r = m - 1;
    }
    return l;
  }
}
