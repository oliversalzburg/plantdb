import { DateTime } from "luxon";
import { DatabaseFormat } from "./DatabaseFormat.js";

export type LogEntrySerialized = {
  plantId: string;
  timestamp: string;
  type: string;
  ec?: number;
  ph?: number;
  product?: string;
  note?: string;
};

export class LogEntry {
  #plantId: string;
  #timestamp: Date;
  #type: string;
  #ec: number | undefined;
  #ph: number | undefined;
  #product: string | undefined;
  #note: string | undefined;

  get plantId() {
    return this.#plantId;
  }

  get timestamp() {
    return this.#timestamp;
  }

  get type() {
    return this.#type;
  }

  get ec() {
    return this.#ec;
  }

  get ph() {
    return this.#ph;
  }

  get product() {
    return this.#product;
  }

  get note() {
    return this.#note;
  }

  render(): string {
    return `${this.#plantId} ${this.#timestamp.toISOString()} ${this.type} ${
      this.#note ?? "<no note provided>"
    }`;
  }

  constructor(plantId: string, timestamp: Date = new Date(), type = "Other") {
    this.#plantId = plantId;
    this.#timestamp = timestamp;
    this.#type = type;
  }

  static fromLogEntry(other: LogEntry) {
    const logEntry = new LogEntry(other.#plantId, other.#timestamp, other.#type);
    logEntry.#ec = other.#ec;
    logEntry.#ph = other.#ph;
    logEntry.#product = other.#product;
    logEntry.#note = other.#note;
    return logEntry;
  }

  static fromCSV(dataRow: Array<string>, format: DatabaseFormat): LogEntry {
    const logEntry = new LogEntry(
      dataRow[0],
      DateTime.fromFormat(dataRow[1], format.dateFormat, { zone: format.timezone }).toJSDate(),
      dataRow[2]
    );
    logEntry.#note = dataRow[3];
    logEntry.#ec = LogEntry.tryParseEC(dataRow[4]);
    logEntry.#ph = LogEntry.tryParsePh(dataRow[5]);
    logEntry.#product = dataRow[6];

    return logEntry;
  }

  static tryParseEC(dataValue: string) {
    const number = Number(dataValue);
    if (number === Number(dataValue)) {
      return number;
    }

    if (dataValue.endsWith("µS/cm")) {
      return Number(dataValue.slice(0, dataValue.length - 5));
    }

    return undefined;
  }

  static tryParsePh(dataValue: string) {
    const number = Number(dataValue);
    if (number === Number(dataValue)) {
      return number;
    }

    if (dataValue.includes(",") && !dataValue.includes(".")) {
      return Number(dataValue.replace(/,/, "."));
    }

    return undefined;
  }

  static fromJSON(dataObject: LogEntrySerialized) {
    const logEntry = new LogEntry(
      dataObject.plantId,
      new Date(dataObject.timestamp),
      dataObject.type
    );
    logEntry.#ec = dataObject.ec ?? logEntry.#ec;
    logEntry.#ph = dataObject.ph ?? logEntry.#ph;
    logEntry.#product = dataObject.product ?? logEntry.#product;
    logEntry.#note = dataObject.note ?? logEntry.#note;
    return logEntry;
  }

  toJSON(): LogEntrySerialized {
    return {
      plantId: this.plantId,
      timestamp: this.timestamp.toISOString(),
      type: this.type,
      ec: this.ec,
      ph: this.ph,
      product: this.product,
      note: this.note,
    };
  }
}
