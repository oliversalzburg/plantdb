import { DateTime } from "luxon";
import { floatFromCSV, intFromCSV, valueFromCSV } from "./csv/Tools";
import { DatabaseFormat } from "./DatabaseFormat";
import { MATCH_PID } from "./Plant";
import { PlantDB } from "./PlantDB";
import { PlantDBEntity } from "./PlantDBEntity";

/**
 * A hash of internally known event types to a human-readable, English version.
 */
export const EventTypes = {
  /**
   * Typically, this marks the first event of a plant, if that plant was acquired (purchased) from a vendor.
   */
  Acquisition: "Acquisition",

  /**
   * A plant was fertilized.
   */
  Fertilization: "Fertilization",

  /**
   * A measurement has been taken from the plant.
   */
  Measurement: "Measurement",

  /**
   * Something not further categorizable has been observed about the plant.
   */
  Observation: "Observation",

  /**
   * A pest situation has been acted on.
   */
  PestControl: "Pest control",

  /**
   * A pest situation has been identified.
   */
  PestInfestation: "Pest infestation",

  /**
   * Branches have been pruned.
   */
  Pruning: "Pruning",

  /**
   * Plant was moved from one location to another one.
   */
  Relocation: "Relocation",

  /**
   * Plant was put into a (new) pot. Usually also marks the first event of a plant that was created from a cutting.
   */
  Repotting: "Repotting",

  /**
   * Roots have been pruned.
   */
  RootPruning: "Root pruning",

  /**
   * The plant was shaped. For example, through wiring branches. Not to be confused with Pruning.
   */
  Shaping: "Shaping",

  /**
   * Any form of irrigation
   */
  Watering: "Watering",
} as const;

/**
 * All possible values for internally known event types.
 */
export type EventType = (typeof EventTypes)[keyof typeof EventTypes];

/**
 * Describes an object containing all the fields required to initialize a `LogEntry`.
 */
export type LogEntrySerialized = {
  /**
   * @inheritDoc LogEntry.id
   */
  id: number;

  /**
   * @inheritDoc LogEntry.plantId
   */
  plantId: string;

  /**
   * @inheritDoc LogEntry.timestamp
   */
  timestamp: Date;

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
   * @inheritDoc LogEntry.notes
   */
  notes?: string;
};

/**
 * A single entry in a PlantDB log.
 */
export class LogEntry extends PlantDBEntity {
  #plantDb: PlantDB;
  #id: number;
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
   * A unique ID for this log entry.
   * If this log entry was read from a file, this ID usually indicates the
   * line in the file it originates from.
   */
  get id() {
    return this.#id;
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
        }' in plant cache. Ensure PlantDB has been initialized with PlantDB.fromCSV()!`,
      );
    }
    return plant;
  }

  /**
   * Constructs a new `LogEntry`.
   *
   * @param plantDb The `PlantDB` this `LogEntry` belongs to.
   * @param id The ID of the log entry.
   * @param plantId The ID of the plant.
   * @param timestamp The date/time the event was recorded.
   * @param type The type of event.
   */
  private constructor(
    plantDb: PlantDB,
    id: number,
    plantId: string,
    timestamp: Date,
    type: string,
  ) {
    super();

    this.#plantDb = plantDb;
    this.#id = id;
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
      initializer?.id ?? other.#id,
      initializer?.plantId ?? other.#plantId,
      initializer?.timestamp ?? other.#timestamp,
      initializer?.type ?? other.#type,
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
   * @param id The ID to assign to the log entry.
   * @returns The constructed `LogEntry`.
   */
  static fromCSVData(
    plantDb: PlantDB,
    dataRow: Array<string>,
    databaseFormat: DatabaseFormat,
    id: number,
  ): LogEntry {
    if (!MATCH_PID.test(dataRow[0])) {
      throw new Error("Invalid PID");
    }

    const logEntry = new LogEntry(
      plantDb,
      id,
      dataRow[0],
      DateTime.fromFormat(dataRow[1], databaseFormat.dateFormat, {
        zone: databaseFormat.timezone,
      }).toJSDate(),
      dataRow[2],
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
      DateTime.fromJSDate(serialized.timestamp).toFormat(databaseFormat.dateFormat),
      serialized.type,
      serialized.notes,
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
      dataObject.id,
      dataObject.plantId,
      new Date(dataObject.timestamp),
      dataObject.type,
    );
    logEntry.#ec = dataObject.ec ?? logEntry.#ec;
    logEntry.#ph = dataObject.ph ?? logEntry.#ph;
    logEntry.#productUsed = dataObject.productUsed ?? logEntry.#productUsed;
    logEntry.#notes = dataObject.notes ?? logEntry.#notes;

    return logEntry;
  }

  /**
   * Parse a JSON object and construct a new `LogEntry` from it.
   *
   * @param plantDb The `PlantDB` this `LogEntry` belongs to.
   * @param data The JSON-compliant log entry.
   * @returns The new `LogEntry`.
   */
  static fromJSON(plantDb: PlantDB, data: LogEntrySerialized) {
    return LogEntry.fromJSObject(plantDb, data);
  }

  /**
   * Parse a JSON string and construct a new `LogEntry` from it.
   *
   * @param plantDb The `PlantDB` this `LogEntry` belongs to.
   * @param dataString The JSON-serialized log entry as a string.
   * @returns The new `LogEntry`.
   */
  static fromJSONString(plantDb: PlantDB, dataString: string) {
    return LogEntry.fromJSON(plantDb, JSON.parse(dataString) as LogEntrySerialized);
  }

  /**
   * Serialize this log entry into a plain JS hash.
   *
   * @returns A simple hash with all of this log entry's properties.
   */
  toJSObject(): LogEntrySerialized {
    return {
      id: this.#id,
      plantId: this.#plantId,
      timestamp: this.#timestamp,
      type: this.#type,
      ec: this.#ec,
      ph: this.#ph,
      productUsed: this.#productUsed,
      notes: this.#notes,
    };
  }

  /** @inheritDoc */
  override toJSON() {
    return this.toJSObject();
  }
}
