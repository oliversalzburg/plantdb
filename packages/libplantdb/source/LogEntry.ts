import { DateTime } from "luxon";
import { DatabaseFormat, EventTypes } from "./DatabaseFormat";

/**
 * Describes an object containing all the fields required to initialize a `LogEntry`.
 */
export type LogEntrySerialized = {
  /**
   * The line in the original CSV input this entry originated from.
   */
  sourceLine: number;

  /**
   * The ID of the plant.
   */
  plantId: string;

  /**
   * A string representation of a `Date`.
   */
  timestamp: string;

  /**
   * The user-supplied type of this entry.
   */
  type: string;

  /**
   * The EC value recorded with the entry, if any.
   */
  ec?: number;

  /**
   * The pH value recorded with the entry, if any.
   */
  ph?: number;

  /**
   * The product that was used during the event, if any.
   */
  productUsed?: string;

  /**
   * A note that was recorded with the event, if any.
   */
  note?: string;
};

/**
 * A single entry in a PlantDB log.
 */
export class LogEntry {
  #sourceLine: number;
  #plantId: string;
  #timestamp: Date;
  #type: string;
  #ec: number | undefined;
  #ph: number | undefined;
  #productUsed: string | undefined;
  #note: string | undefined;

  /**
   * If this log entry was read from a file, this indicates the line in the file it originates from.
   */
  get sourceLine() {
    return this.#sourceLine;
  }

  /**
   * The ID of the plant. Expected to be in the format `PID-number`.
   */
  get plantId() {
    return this.#plantId;
  }

  /**
   * The date/time the entry was recorded at.
   */
  get timestamp() {
    return this.#timestamp;
  }

  /**
   * The type of the event, as it appears in the original user data.
   */
  get type() {
    return this.#type;
  }

  /**
   * The note that the user recorded with the event.
   */
  get note() {
    return this.#note;
  }

  /**
   * The EC value that was recorded with the event.
   */
  get ec() {
    return this.#ec;
  }

  /**
   * The pH value that was recorded with the event.
   */
  get ph() {
    return this.#ph;
  }

  /**
   * The product that was used on the plant in this event.
   */
  get productUsed() {
    return this.#productUsed;
  }

  /**
   * An easily indexable string that represents the most relevant bits of text associated with the record.
   */
  get indexableText() {
    return `${this.plantId} ${this.type} ${this.productUsed ?? ""} ${
      this.note ?? ""
    }`.toLocaleLowerCase();
  }

  /**
   * Constructs a new `LogEntry`.
   * @param plantId The ID of the plant.
   * @param timestamp The date/time the event was recorded.
   * @param type The type of event.
   */
  constructor(
    sourceLine: number,
    plantId: string,
    timestamp: Date = new Date(),
    type: string = EventTypes.Observation
  ) {
    this.#sourceLine = sourceLine;
    this.#plantId = plantId;
    this.#timestamp = timestamp;
    this.#type = type;
  }

  static fromLogEntry(other: LogEntry) {
    const logEntry = new LogEntry(other.#sourceLine, other.#plantId, other.#timestamp, other.#type);
    logEntry.#ec = other.#ec;
    logEntry.#ph = other.#ph;
    logEntry.#productUsed = other.#productUsed;
    logEntry.#note = other.#note;
    return logEntry;
  }

  static fromCSVData(
    dataRow: Array<string>,
    format: DatabaseFormat,
    sourceFileLineNumber: number
  ): LogEntry {
    const logEntry = new LogEntry(
      sourceFileLineNumber,
      dataRow[0],
      DateTime.fromFormat(dataRow[1], format.dateFormat, { zone: format.timezone }).toJSDate(),
      dataRow[2]
    );
    logEntry.#note = dataRow[3];
    logEntry.#ec = LogEntry.tryParseEC(dataRow[4]);
    logEntry.#ph = LogEntry.tryParsePh(dataRow[5]);
    logEntry.#productUsed = dataRow[6];

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

  static fromJSObject(dataObject: LogEntrySerialized) {
    const logEntry = new LogEntry(
      dataObject.sourceLine,
      dataObject.plantId,
      new Date(dataObject.timestamp),
      dataObject.type
    );
    logEntry.#ec = dataObject.ec ?? logEntry.#ec;
    logEntry.#ph = dataObject.ph ?? logEntry.#ph;
    logEntry.#productUsed = dataObject.productUsed ?? logEntry.#productUsed;
    logEntry.#note = dataObject.note ?? logEntry.#note;
    return logEntry;
  }

  /**
   * Parse a JSON string and construct a new `LogEntry` from it.
   * @param dataString The JSON-serialized log entry.
   * @returns The new `LogEntry`.
   */
  static fromJSON(dataString: string) {
    const data = JSON.parse(dataString) as LogEntrySerialized;
    return LogEntry.fromJSObject(data);
  }

  toJSObject(): LogEntrySerialized {
    return {
      sourceLine: this.#sourceLine,
      plantId: this.#plantId,
      timestamp: this.#timestamp.toISOString(),
      type: this.#type,
      ec: this.#ec,
      ph: this.#ph,
      productUsed: this.#productUsed,
      note: this.#note,
    };
  }

  /**
   * Pre-serialize the `LogEntry` into an object ready to be turned into a JSON string.
   * @returns The `LogEntry` as JSON-serializable object.
   */
  toJSON() {
    return this.toJSObject();
  }
}
