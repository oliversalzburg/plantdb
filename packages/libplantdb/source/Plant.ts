import { LogEntry } from "./LogEntry.js";
import { kindFlatten, kindSummarize } from "./Tools.js";

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
   * The ID of the plant.
   */
  id: string;

  /**
   * The name of the plant.
   */
  name?: string;

  /**
   * The kind (or kinds) of the plant.
   */
  kind?: string | Array<string>;

  /**
   * The current substrate the plant is planted in.
   */
  substrate?: string;

  /**
   * The shape of the pot, when viewed from above.
   */
  potShapeTop?: string;

  /**
   * The color of the pot.
   */
  potColor?: string;

  /**
   * Does the plant current sit on a saucer?
   */
  onSaucer?: boolean;

  /**
   * The current location of the plant.
   */
  location?: string;

  /**
   * The ideal pH value for this plant.
   */
  phIdeal?: number;

  /**
   * The ideal EC value for this plant.
   */
  ecIdeal?: number;

  /**
   * The ideal temperature for this plant.
   */
  tempIdeal?: number;

  /**
   * Any notes about this plant.
   */
  notes?: string;
};

export class Plant {
  #id: string;
  #name: string | undefined;
  #kind: string | Array<string> | undefined;
  #substrate: string | undefined;
  #potShapeTop: PotShapeTop | string | undefined;
  #potColor: PotColor | string | undefined;
  #onSaucer: boolean | undefined;
  #location: string | undefined;
  #phIdeal: number | undefined;
  #ecIdeal: number | undefined;
  #tempIdeal: number | undefined;
  #notes = "";

  #log: ReadonlyArray<LogEntry> | undefined = undefined;

  get id() {
    return this.#id;
  }

  get name() {
    return this.#name;
  }

  get kind() {
    return this.#kind;
  }

  get substrate() {
    return this.#substrate;
  }

  get potShapeTop() {
    return this.#potShapeTop;
  }

  get potColor() {
    return this.#potColor;
  }

  get onSaucer() {
    return this.#onSaucer;
  }

  get location() {
    return this.#location;
  }

  get phIdeal() {
    return this.#phIdeal;
  }

  get ecIdeal() {
    return this.#ecIdeal;
  }

  get tempIdeal() {
    return this.#tempIdeal;
  }

  get notes() {
    return this.#notes;
  }

  get indexableText() {
    return `${this.id} ${this.name ?? ""} ${kindFlatten(this.kind)}`.toLocaleLowerCase();
  }

  get log() {
    return this.#log?.filter(logEntry => logEntry.plantId === this.id) ?? [];
  }

  get logEntryOldest(): LogEntry | undefined {
    return this.log[0];
  }
  get logEntryLatest(): LogEntry | undefined {
    return this.log[this.log.length - 1];
  }

  private constructor(plantId: string) {
    this.#id = plantId;
  }

  identify() {
    return `Plant ${this.#name ?? "<unnamed>"} (${this.id}) ${kindSummarize(this.#kind)}`;
  }

  toString() {
    return this.identify();
  }

  static Empty() {
    return new Plant("PID-0");
  }

  static fromPlant(other: Plant) {
    const plant = new Plant(other.id);
    plant.#name = other.#name;
    plant.#kind = other.#kind;
    plant.#substrate = other.#substrate;
    plant.#potShapeTop = other.#potShapeTop;
    plant.#potColor = other.#potColor;
    plant.#location = other.#location;
    plant.#phIdeal = other.#phIdeal;
    plant.#ecIdeal = other.#ecIdeal;
    plant.#tempIdeal = other.#tempIdeal;
    plant.#notes = other.#notes;

    plant.#log = other.#log;
    return plant;
  }

  static fromCSVData(dataRow: Array<string>, log?: ReadonlyArray<LogEntry>): Plant {
    const plant = new Plant(dataRow[0]);
    plant.#name = dataRow[1];
    plant.#kind = dataRow[2].includes("\n") ? dataRow[2].split("\n") : dataRow[2];
    plant.#substrate = dataRow[3];
    plant.#potShapeTop = dataRow[4];
    plant.#potColor = dataRow[5];
    plant.#onSaucer = dataRow[6] === "TRUE";
    plant.#location = dataRow[7];
    plant.#phIdeal = Number(dataRow[8]);
    plant.#ecIdeal = Number(dataRow[9]);
    plant.#tempIdeal = Number(dataRow[10]);
    plant.#notes = dataRow[11];

    plant.#log = log;
    return plant;
  }

  static fromJSObject(dataObject: PlantSerialized, log?: Array<LogEntry>) {
    const plant = new Plant(dataObject.id);
    plant.#name = dataObject.name ?? plant.#name;
    plant.#kind = dataObject.kind ?? plant.#kind;
    plant.#substrate = dataObject.substrate ?? plant.#substrate;
    plant.#potShapeTop = dataObject.potShapeTop ?? plant.#potShapeTop;
    plant.#potColor = dataObject.potColor ?? plant.#potColor;
    plant.#onSaucer = dataObject.onSaucer ?? plant.#onSaucer;
    plant.#location = dataObject.location ?? plant.#location;
    plant.#phIdeal = dataObject.phIdeal ?? plant.#phIdeal;
    plant.#ecIdeal = dataObject.ecIdeal ?? plant.#ecIdeal;
    plant.#tempIdeal = dataObject.tempIdeal ?? plant.#tempIdeal;
    plant.#notes = dataObject.notes ?? plant.#notes;

    plant.#log = log;
    return plant;
  }

  /**
   * Parse a JSON string and construct a new `Plant` from it.
   * @param dataString The JSON-serialized plant.
   * @returns The new `Plant`.
   */
  static fromJSON(dataString: string) {
    const data = JSON.parse(dataString) as PlantSerialized;
    return Plant.fromJSObject(data);
  }

  toJSObject(): PlantSerialized {
    return {
      id: this.id,
      name: this.name,
      kind: this.kind,
      substrate: this.substrate,
      potShapeTop: this.potShapeTop,
      potColor: this.potColor,
      onSaucer: this.onSaucer,
      location: this.location,
      phIdeal: this.phIdeal,
      ecIdeal: this.ecIdeal,
      tempIdeal: this.tempIdeal,
      notes: this.notes,
    };
  }

  /**
   * Pre-serialize the `Plant` into an object ready to be turned into a JSON string.
   * @returns The `Plant` as JSON-serializable object.
   */
  toJSON() {
    return this.toJSObject();
  }
}
