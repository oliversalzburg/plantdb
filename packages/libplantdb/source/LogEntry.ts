import { DateTime } from "luxon";
import { DatabaseFormat } from "./DatabaseFormat.js";
import { MATCH_PID } from "./Plant.js";

export class LogEntry {
  #plantId: string;
  #timestamp: Date;
  #type: string;
  #ec: number | undefined;
  #ph: number | undefined;
  #product: string | undefined;
  #note: string | undefined;

  render(): string {
    return `${this.#plantId} ${this.#timestamp.toISOString()} ${
      this.#note ?? "<no note provided>"
    }`;
  }

  constructor(plantId: string, timestamp: Date = new Date(), type = "") {
    this.#plantId = plantId;
    this.#timestamp = timestamp;
    this.#type = type;
  }

  static validate(dataRow: Array<string>) {
    const hasValidPid = MATCH_PID.test(dataRow[0]);
    const date = new Date(dataRow[1]);
    const hasValidDate = !isNaN(date.valueOf());
    return hasValidPid && hasValidDate;
  }

  static deserialize(dataRow: Array<string>, format: DatabaseFormat): LogEntry {
    const logEntry = new LogEntry(
      dataRow[0],
      DateTime.fromFormat(dataRow[1], format.dateFormat).toJSDate(),
      dataRow[2]
    );
    logEntry.#ec = Number(dataRow[3]);
    logEntry.#ph = Number(dataRow[4]);
    logEntry.#product = dataRow[5];
    logEntry.#note = dataRow[6];
    return logEntry;
  }
}
