import { DateTime } from "luxon";
import { DatabaseFormat, EventType } from "./DatabaseFormat";
import { MATCH_PID } from "./Plant";
import { PlantDB } from "./PlantDB";
import { floatFromCSV, intFromCSV, valueFromCSV } from "./Tools";

/**
 * Describes an object containing all the fields required to initialize a `LogEntry`.
 */
export type LogEntrySerialized = {
  /**
   * @inheritDoc LogEntry.sourceLine
   */
  sourceLine: number;

  /**
   * @inheritDoc LogEntry.plantId
   */
  plantId: string;

  /**
   * @inheritDoc LogEntry.timestamp
   */
  timestamp: string;

  /**
   * @inheritDoc LogEntry.type
   */
  type: string;

  /**
   * @inheritDoc LogEntry.ec
   */
  ec?: number;

  /**
   * @inheritDoc LogEntry.ph
   */
  ph?: number;

  /**
   * @inheritDoc LogEntry.productUsed
   */
  productUsed?: string | Array<string>;

  /**
   * @inheritDoc LogEntry.note
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
  #productUsed: string | Array<string> | undefined;
  #notes: string | undefined;

  /**
   * The `PlantDB` this log entry is associated with.
   */
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
   * The notes that the user recorded with the event.
   */
  get notes() {
    return this.#notes;
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

  /**
   * Constructs a new `LogEntry`, given another log entry as a template and a has with additional properties.
   *
   * @param other The `LogEntry` to copy properties from.
   * @param initializer A hash containing properties to add to or override in the template.
   * @returns A new `LogEntry` with the `other` log entry and the initializer merged into it.
   */
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
    logEntry.#notes = initializer?.notes ? initializer.notes : other.#notes;
    return logEntry;
  }

  /**
   * Constructs a `LogEntry` from CSV data.
   *
   * @param plantDb The `PlantDB` to create the log entry in.
   * @param dataRow The strings that were read from the CSV input.
   * @param databaseFormat The `DatabaseFormat` to use when interpreting values.
   * @param sourceFileLineNumber The line in the source document the values were read from.
   * @returns The constructed `LogEntry`.
   */
  static fromCSVData(
    plantDb: PlantDB,
    dataRow: Array<string>,
    databaseFormat: DatabaseFormat,
    sourceFileLineNumber: number
  ): LogEntry {
    if (!MATCH_PID.test(dataRow[0])) {
      throw new Error("Invalid PID");
    }

    const logEntry = new LogEntry(
      plantDb,
      sourceFileLineNumber,
      dataRow[0],
      DateTime.fromFormat(dataRow[1], databaseFormat.dateFormat, {
        zone: databaseFormat.timezone,
      }).toJSDate(),
      dataRow[2]
    );

    let rowPointer = 3;
    logEntry.#notes = valueFromCSV(dataRow, rowPointer++, false) as string | undefined;
    logEntry.#ec = intFromCSV(dataRow, rowPointer++, plantDb.databaseFormat);
    logEntry.#ph = floatFromCSV(dataRow, rowPointer++, plantDb.databaseFormat);
    logEntry.#productUsed = valueFromCSV(dataRow, rowPointer++);

    return logEntry;
  }

  /**
   * Seralize the `LogEntry` so it can be turned into CSV.
   *
   * @param databaseFormat The `DatabaseFormat` to use when serializing values.
   * @returns The `LogEntry` ready to be serialized into CSV.
   */
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

  /**
   * Constructs a `LogEntry` from a plain hash with initialization values.
   *
   * @param plantDb The `PlantDB` to create the log entry in.
   * @param dataObject The hash containing the initialization values for the `LogEntry`.
   * @returns The constructed `LogEntry`.
   */
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
    logEntry.#notes = dataObject.note ?? logEntry.#notes;

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

  /**
   * Serialize this log entry into a plain JS hash.
   *
   * @returns A simple hash with all of this log entry's properties.
   */
  toJSObject(): LogEntrySerialized {
    return {
      sourceLine: this.#sourceLine,
      plantId: this.#plantId,
      timestamp: this.#timestamp.toISOString(),
      type: this.#type,
      ec: this.#ec,
      ph: this.#ph,
      productUsed: this.#productUsed,
      note: this.#notes,
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
