import { DatabaseFormat } from "./DatabaseFormat";
import { LogEntry } from "./LogEntry";

export class PlantLog {
  static fromCSV(databaseFormat: DatabaseFormat, plantLogData: Array<Array<string>>) {
    const plantLog = new Array<LogEntry>();
    const entryTypes = new Set<string>();
    for (const [index, logRecord] of plantLogData.entries()) {
      const logEntry = LogEntry.fromCSVData(logRecord, databaseFormat, index);
      plantLog.push(logEntry);
      entryTypes.add(logEntry.type);
    }
    plantLog.sort((a, b) => a.timestamp.valueOf() - b.timestamp.valueOf());
    return { log: plantLog, entryTypes };
  }
}
