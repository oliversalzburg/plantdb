import { DateTime } from "luxon";
import { DatabaseFormat, EventType } from "./DatabaseFormat";
import { PlantDB } from "./PlantDB";
import { tryParseFloat, tryParseInt } from "./Tools";

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
  #plantDb: PlantDB;
  #sourceLine: number;
  #plantId: string;
  #timestamp: Date;
  #type: string;
  #ec: number | undefined;
  #ph: number | undefined;
  #productUsed: string | undefined;
  #note: string | undefined;

  get plantDb() {
    return this.#plantDb;
  }

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
   * The plant this record refers to.
   */
  get plant() {
    const plant = this.#plantDb?.plants.get(this.#plantId);
    if (!plant) {
      throw new Error(
        `Unable to find plant '${
          this.#plantId
        }' in plant cache. Ensure PlantDB has been initialized with PlantDB.fromCSV()!`
      );
    }
    return plant;
  }

  get plants() {
    return this.#plantDb.plants;
  }

  /**
   * Constructs a new `LogEntry`.
   *
   * @param plantDb The `PlantDB` this `LogEntry` belongs to.
   * @param sourceLine The line in the source CSV document this entry originated from.
   * @param plantId The ID of the plant.
   * @param timestamp The date/time the event was recorded.
   * @param type The type of event.
   */
  private constructor(
    plantDb: PlantDB,
    sourceLine: number,
    plantId: string,
    timestamp: Date,
    type: string | EventType
  ) {
    this.#plantDb = plantDb;
    this.#sourceLine = sourceLine;
    this.#plantId = plantId;
    this.#timestamp = timestamp;
    this.#type = type;
  }

  static fromLogEntry(other: LogEntry, initializer?: Partial<LogEntry>) {
    const logEntry = new LogEntry(
      initializer?.plantDb ?? other.#plantDb,
      initializer?.sourceLine ?? other.#sourceLine,
      initializer?.plantId ?? other.#plantId,
      initializer?.timestamp ?? other.#timestamp,
      initializer?.type ?? other.#type
    );
    logEntry.#ec = initializer?.ec ? initializer.ec : other.#ec;
    logEntry.#ph = initializer?.ph ? initializer.ph : other.#ph;
    logEntry.#productUsed = initializer?.productUsed ? initializer.productUsed : other.#productUsed;
    logEntry.#note = initializer?.note ? initializer.note : other.#note;
    return logEntry;
  }

  static fromCSVData(
    plantDb: PlantDB,
    dataRow: Array<string>,
    format: DatabaseFormat,
    sourceFileLineNumber: number
  ): LogEntry {
    const logEntry = new LogEntry(
      plantDb,
      sourceFileLineNumber,
      dataRow[0],
      DateTime.fromFormat(dataRow[1], format.dateFormat, { zone: format.timezone }).toJSDate(),
      dataRow[2]
    );
    logEntry.#note = dataRow[3] !== "" ? dataRow[3] : undefined;
    logEntry.#ec = tryParseInt(dataRow[4], format);
    logEntry.#ph = tryParseFloat(dataRow[5], format);
    logEntry.#productUsed = dataRow[6] !== "" ? dataRow[6] : undefined;

    return logEntry;
  }

  toCSVData(databaseFormat: DatabaseFormat) {
    const serialized = this.toJSObject();
    return [
      serialized.plantId,
      DateTime.fromISO(serialized.timestamp).toFormat(databaseFormat.dateFormat),
      serialized.type,
      serialized.note,
      serialized.ec,
      serialized.ph,
      serialized.productUsed,
    ];
  }

  static fromJSObject(plantDb: PlantDB, dataObject: LogEntrySerialized) {
    const logEntry = new LogEntry(
      plantDb,
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
   *
   * @param plantDb The `PlantDB` this `LogEntry` belongs to.
   * @param dataString The JSON-serialized log entry.
   * @returns The new `LogEntry`.
   */
  static fromJSON(plantDb: PlantDB, dataString: string) {
    const data = JSON.parse(dataString) as LogEntrySerialized;
    return LogEntry.fromJSObject(plantDb, data);
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
   *
   * @returns The `LogEntry` as JSON-serializable object.
   */
  toJSON() {
    return this.toJSObject();
  }
}
