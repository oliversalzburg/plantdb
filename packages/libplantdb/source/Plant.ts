import { boolFromCSV, floatFromCSV, intFromCSV, valueFromCSV, valueToCSV } from "./csv/Tools.js";
import { DatabaseFormat } from "./DatabaseFormat.js";
import { LogEntry } from "./LogEntry.js";
import { PlantDB } from "./PlantDB.js";
import { PlantDBEntity } from "./PlantDBEntity.js";
import { kindSummarize } from "./Tools.js";

/**
 * Matches a Plant ID.
 */
export const MATCH_PID = /PID-\d{1,6}/;

/**
 * Matches all Plant IDs.
 */
export const MATCH_PID_ALL = /PID-\d{1,6}/g;

/**
 * Internally understood pot shapes.
 */
export type PotShapeTop = "Oval" | "Rectangle" | "Round" | "Square";

/**
 * Internally understood pot colors.
 */
export type PotColor =
  | "Black"
  | "Brown"
  | "Grey"
  | "LightGrey"
  | "Orange"
  | "Transparent"
  | "White";

/**
 * Describes an object containing all the fields required to initialize a `Plant`.
 */
export type PlantSerialized = {
  /**
   * @inheritDoc Plant.id
   */
  id: string;

  /**
   * @inheritDoc Plant.isArchived
   */
  isArchived?: boolean;

  /**
   * @inheritDoc Plant.name
   */
  name?: string;

  /**
   * @inheritDoc Plant.kind
   */
  kind?: string | Array<string>;

  /**
   * @inheritDoc Plant.substrate
   */
  substrate?: string | Array<string>;

  /**
   * @inheritDoc Plant.potShapeTop
   */
  potShapeTop?: string;

  /**
   * @inheritDoc Plant.potColor
   */
  potColor?: string;

  /**
   * @inheritDoc Plant.onSaucer
   */
  onSaucer?: boolean;

  /**
   * @inheritDoc Plant.location
   */
  location?: string | Array<string>;

  /**
   * @inheritDoc Plant.phMin
   */
  phMin?: number;

  /**
   * @inheritDoc Plant.phMax
   */
  phMax?: number;

  /**
   * @inheritDoc Plant.ecMin
   */
  ecMin?: number;

  /**
   * @inheritDoc Plant.ecMax
   */
  ecMax?: number;

  /**
   * @inheritDoc Plant.tempMin
   */
  tempMin?: number;

  /**
   * @inheritDoc Plant.tempMax
   */
  tempMax?: number;

  /**
   * @inheritDoc Plant.notes
   */
  notes?: string;

  /**
   * @inheritDoc Plant.plantgeekId
   */
  plantgeekId?: string | Array<string>;
};

export class Plant extends PlantDBEntity {
  #plantDb: PlantDB;
  #id: string;
  #isArchived: boolean | undefined;
  #name: string | undefined;
  #kind: string | Array<string> | undefined;
  #location: string | Array<string> | undefined;
  #notes: string | undefined;

  // Pot
  #substrate: string | Array<string> | undefined;
  #potShapeTop: PotShapeTop | string | undefined;
  #potColor: PotColor | string | undefined;
  #onSaucer: boolean | undefined;

  // Diagnostics
  #phMin: number | undefined;
  #phMax: number | undefined;
  #ecMin: number | undefined;
  #ecMax: number | undefined;
  #tempMin: number | undefined;
  #tempMax: number | undefined;

  // Externals
  #plantgeekId: string | Array<string> | undefined;

  get plantDb() {
    return this.#plantDb;
  }

  /**
   * The ID of the plant.
   */
  get id() {
    return this.#id;
  }

  /**
   * Has this plant been archived?
   * Archived plants are usually ignored in primary use cases.
   */
  get isArchived() {
    return this.#isArchived;
  }

  /**
   * The name of the plant.
   */
  get name() {
    return this.#name;
  }

  /**
   * The kind(s) of the plant.
   */
  get kind() {
    return this.#kind;
  }

  /**
   * The current substrate(s) the plant is planted in.
   */
  get substrate() {
    return this.#substrate;
  }

  /**
   * The shape of the pot, when viewed from above.
   */
  get potShapeTop() {
    return this.#potShapeTop;
  }

  /**
   * The color of the pot.
   */
  get potColor() {
    return this.#potColor;
  }

  /**
   * Does the plant current sit on a saucer?
   */
  get onSaucer() {
    return this.#onSaucer;
  }

  /**
   * The current location of the plant.
   */
  get location() {
    return this.#location;
  }

  /**
   * The minimum pH value for this plant.
   */
  get phMin() {
    return this.#phMin;
  }

  /**
   * The maximum pH value for this plant.
   */
  get phMax() {
    return this.#phMax;
  }

  /**
   * The minium EC value for this plant.
   */
  get ecMin() {
    return this.#ecMin;
  }

  /**
   * The maximum EC value for this plant.
   */
  get ecMax() {
    return this.#ecMax;
  }

  /**
   * The minimum temperature for this plant.
   */
  get tempMin() {
    return this.#tempMin;
  }

  /**
   * The maximum temperature for this plant.
   */
  get tempMax() {
    return this.#tempMax;
  }

  /**
   * Any notes about this plant.
   */
  get notes() {
    return this.#notes;
  }

  /**
   * ID(s) of plant(s) on plantgeek.co that provide more information about this plant.
   */
  get plantgeekId() {
    return this.#plantgeekId;
  }

  /**
   * The log entries in the PlantDB relating to this plant.
   */
  get log() {
    return this.#plantDb.log.filter(logEntry => logEntry.plantId === this.id) ?? [];
  }

  /**
   * Convenience access to first log entry for this plant.
   */
  get logEntryOldest(): LogEntry | undefined {
    return this.log[0];
  }

  /**
   * Convenience access to latest log entry for this plant.
   */
  get logEntryLatest(): LogEntry | undefined {
    return this.log[this.log.length - 1];
  }

  /**
   * Constructs a new `Plant`.
   *
   * @param plantDb The PlantDB this plant should be created in.
   * @param plantId The ID of this plant.
   */
  private constructor(plantDb: PlantDB, plantId: string) {
    super();

    this.#plantDb = plantDb;
    this.#id = plantId;
  }

  toString() {
    return `Plant ${this.#name ?? "<unnamed>"} (${this.id}) ${kindSummarize(this.#kind)}`;
  }

  /**
   * Constructs a new `Plant`, given another plant as a template and a hash with additional properties.
   *
   * @param other The `Plant` to copy properties from.
   * @param initializer A hash containing properties to add to or override in the template.
   * @returns A new `Plant` with the `other` plant and the initializer properties merged into it.
   */
  static fromPlant(other: Plant, initializer?: Partial<Plant>) {
    const plant = new Plant(initializer?.plantDb ?? other.#plantDb, initializer?.id ?? other.id);
    plant.#isArchived = initializer?.isArchived ?? other.#isArchived;
    plant.#name = initializer?.name ?? other.#name;
    plant.#kind = initializer?.kind ?? other.#kind;
    plant.#substrate = initializer?.substrate ?? other.#substrate;
    plant.#potShapeTop = initializer?.potShapeTop ?? other.#potShapeTop;
    plant.#potColor = initializer?.potColor ?? other.#potColor;
    plant.#onSaucer = initializer?.onSaucer ?? other.#onSaucer;
    plant.#location = initializer?.location ?? other.#location;
    plant.#phMin = initializer?.phMin ?? other.phMin;
    plant.#phMax = initializer?.phMax ?? other.phMax;
    plant.#ecMin = initializer?.ecMin ?? other.#ecMin;
    plant.#ecMax = initializer?.ecMax ?? other.#ecMax;
    plant.#tempMin = initializer?.tempMin ?? other.#tempMin;
    plant.#tempMax = initializer?.tempMax ?? other.#tempMax;
    plant.#notes = initializer?.notes ?? other.#notes;
    plant.#plantgeekId = initializer?.plantgeekId ?? other.#plantgeekId;
    return plant;
  }

  /**
   * Constructs a `Plant` from CSV data.
   *
   * @param plantDb The `PlantDB` to create the plant in.
   * @param dataRow The strings that were read from the CSV input.
   * @returns The constructed `Plant`.
   */
  static fromCSVData(plantDb: PlantDB, dataRow: Array<string>): Plant {
    let rowPointer = 0;
    const plant = new Plant(plantDb, dataRow[rowPointer++]);
    plant.#isArchived = boolFromCSV(dataRow, rowPointer++);
    plant.#name = valueFromCSV(dataRow, rowPointer++, false) as string | undefined;
    plant.#kind = valueFromCSV(dataRow, rowPointer++);
    plant.#substrate = valueFromCSV(dataRow, rowPointer++);
    plant.#potShapeTop = valueFromCSV(dataRow, rowPointer++, false) as string | undefined;
    plant.#potColor = valueFromCSV(dataRow, rowPointer++, false) as string | undefined;
    plant.#onSaucer = boolFromCSV(dataRow, rowPointer++);
    plant.#location = valueFromCSV(dataRow, rowPointer++);
    plant.#phMin = floatFromCSV(dataRow, rowPointer++, plantDb.databaseFormat);
    plant.#phMax = floatFromCSV(dataRow, rowPointer++, plantDb.databaseFormat);
    plant.#ecMin = intFromCSV(dataRow, rowPointer++, plantDb.databaseFormat);
    plant.#ecMax = intFromCSV(dataRow, rowPointer++, plantDb.databaseFormat);
    plant.#tempMin = floatFromCSV(dataRow, rowPointer++, plantDb.databaseFormat);
    plant.#tempMax = floatFromCSV(dataRow, rowPointer++, plantDb.databaseFormat);
    plant.#notes = valueFromCSV(dataRow, rowPointer++, false) as string | undefined;
    plant.#plantgeekId = valueFromCSV(dataRow, rowPointer++);
    return plant;
  }

  /**
   * Serialize the `Plant` so it can be be turned into CSV.
   *
   * @param databaseFormat The `DatabaseFormat` to use when serializing values.
   * @returns The `Plant` ready to be serialized into CSV.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toCSVData(databaseFormat: DatabaseFormat) {
    const serialized = this.toJSObject();
    return [
      serialized.id,
      serialized.isArchived,
      serialized.name,
      valueToCSV(serialized.kind),
      valueToCSV(serialized.substrate),
      serialized.potShapeTop,
      serialized.potColor,
      serialized.onSaucer === true ? "TRUE" : serialized.onSaucer === false ? "FALSE" : undefined,
      valueToCSV(serialized.location),
      serialized.phMin,
      serialized.phMax,
      serialized.ecMin,
      serialized.ecMax,
      serialized.tempMin,
      serialized.tempMax,
      serialized.notes,
      valueToCSV(serialized.plantgeekId),
    ];
  }

  /**
   * Constructs a `Plant` from a plain hash with initialization values.
   *
   * @param plantDb The `PlantDB` to create the plant in.
   * @param dataObject The hash containing the initialization values for the `Plant`.
   * @returns The constructed `Plant`.
   */
  static fromJSObject(plantDb: PlantDB, dataObject: PlantSerialized) {
    const plant = new Plant(plantDb, dataObject.id);
    plant.#isArchived = dataObject.isArchived ?? plant.#isArchived;
    plant.#name = dataObject.name ?? plant.#name;
    plant.#kind = dataObject.kind ?? plant.#kind;
    plant.#substrate = dataObject.substrate ?? plant.#substrate;
    plant.#potShapeTop = dataObject.potShapeTop ?? plant.#potShapeTop;
    plant.#potColor = dataObject.potColor ?? plant.#potColor;
    plant.#onSaucer = dataObject.onSaucer ?? plant.#onSaucer;
    plant.#location = dataObject.location ?? plant.#location;
    plant.#phMin = dataObject.phMin ?? plant.phMin;
    plant.#phMax = dataObject.phMax ?? plant.phMax;
    plant.#ecMin = dataObject.ecMin ?? plant.#ecMin;
    plant.#ecMax = dataObject.ecMax ?? plant.#ecMax;
    plant.#tempMin = dataObject.tempMin ?? plant.#tempMin;
    plant.#tempMax = dataObject.tempMax ?? plant.#tempMax;
    plant.#notes = dataObject.notes ?? plant.#notes;
    plant.#plantgeekId = dataObject.plantgeekId ?? plant.#plantgeekId;
    return plant;
  }

  /**
   * Parse a JSON string and construct a new `Plant` from it.
   *
   * @param plantDb The `PlantDB` this `Plant` belongs to
   * @param dataString The JSON-serialized plant.
   * @returns The new `Plant`.
   */
  static fromJSON(plantDb: PlantDB, dataString: string) {
    const data = JSON.parse(dataString) as PlantSerialized;
    return Plant.fromJSObject(plantDb, data);
  }

  /**
   * Serialize this plant into a plain JS hash.
   *
   * @returns A simple hash with all of this plant's properties.
   */
  toJSObject(): PlantSerialized {
    return {
      id: this.#id,
      isArchived: this.#isArchived,
      name: this.#name,
      kind: this.#kind,
      substrate: this.#substrate,
      potShapeTop: this.#potShapeTop,
      potColor: this.#potColor,
      onSaucer: this.#onSaucer,
      location: this.#location,
      phMin: this.#phMin,
      phMax: this.#phMax,
      ecMin: this.#ecMin,
      ecMax: this.#ecMax,
      tempMin: this.#tempMin,
      tempMax: this.#tempMax,
      notes: this.#notes,
      plantgeekId: this.#plantgeekId,
    };
  }

  /** @inheritDoc */
  override toJSON() {
    return this.toJSObject();
  }
}
