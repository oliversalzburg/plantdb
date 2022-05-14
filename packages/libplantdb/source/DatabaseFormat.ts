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
  PestControl: "Pest Control",
  /**
   * A pest situation has been identified.
   */
  PestInfestation: "Pest Infestation",
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
export type EventType = keyof typeof EventTypes;

/**
 * Describes a plain JS object, containing all the properties required to initialize
 * a `DatabaseFormat`.
 */
export type DatabaseFormatSerialized = {
  columnSeparator: string;
  dateFormat: string;
  hasHeaderRow: boolean;
  timezone: string;
  typeMap: Record<string, EventType>;
};

/**
 * Describes the format of records in a PlantDB document.
 */
export class DatabaseFormat {
  #columnSeparator = ",";
  #dateFormat = "yyyy-MM-dd HH:mm";
  #hasHeaderRow = true;
  #timezone = "utc";
  #typeMap = new Map<string, EventType>();

  /**
   * The character separating the individual columns of values in the document.
   */
  get columnSeparator() {
    return this.#columnSeparator;
  }

  /**
   * The format that is used to record date/time values in the document.
   * @see https://moment.github.io/luxon/#/parsing?id=table-of-tokens
   */
  get dateFormat() {
    return this.#dateFormat;
  }

  /**
   * Whether this document has an initial row that contains the labels for the columns in the document.
   */
  get hasHeaderRow() {
    return this.#hasHeaderRow;
  }

  /**
   * The time zone in which the date/time values in the document were recorded.
   * @see https://moment.github.io/luxon/#/zones?id=specifying-a-zone
   */
  get timezone() {
    return this.#timezone;
  }

  /**
   * A map of strings that appear as event identifiers in the document and the Plant-DB event types
   * they correlate to.
   */
  get typeMap() {
    return this.#typeMap;
  }

  /**
   * Creates a new `DatabaseFormat`, based on this one, but with a new type map.
   * @param typeMap The type map to use in the new `DatabaseFormat`.
   * @returns The new `DatabaseFormat`.
   */
  withNewTypeMap(typeMap: Map<string, EventType>) {
    const copy = DatabaseFormat.fromDatabaseFormat(this);
    copy.#typeMap = typeMap;
    return copy;
  }

  /**
   * Creates a new `DatabaseFormat`, with the values of another `DatabaseFormat`.
   * @param other The `DatabaseFormat` to copy values from.
   * @returns The new `DatabaseFormat`.
   */
  static fromDatabaseFormat(other: DatabaseFormat) {
    const format = new DatabaseFormat();
    format.#columnSeparator = other.#columnSeparator;
    format.#dateFormat = other.#dateFormat;
    format.#hasHeaderRow = other.#hasHeaderRow;
    format.#timezone = other.#timezone;
    format.#typeMap = new Map(other.#typeMap);
    return format;
  }

  /**
   * Parse a JS object and construct a new `DatabaseFormat` from it.
   * @param data The serialized `DatabaseFormat`.
   * @returns The new `DatabaseFormat`.
   */
  static fromJSObject(data: Partial<DatabaseFormatSerialized>) {
    const format = new DatabaseFormat();
    format.#columnSeparator = data.columnSeparator ?? format.#columnSeparator;
    format.#dateFormat = data.dateFormat ?? format.#dateFormat;
    format.#hasHeaderRow = data.hasHeaderRow ?? format.#hasHeaderRow;
    format.#timezone = data.timezone ?? format.#timezone;

    format.#typeMap = new Map(Object.entries(data.typeMap ?? {}));
    return format;
  }

  /**
   * Parse a JSON string and construct a new `DatabaseFormat` from it.
   * @param dataString The JSON-serialized database format.
   * @returns The new `DatabaseFormat`.
   */
  static fromJSON(dataString: string) {
    const data = JSON.parse(dataString) as Partial<DatabaseFormatSerialized>;
    return DatabaseFormat.fromJSObject(data);
  }

  /**
   * Convert the `DatabaseFormat` into a plain JS object.
   * @returns The `DatabaseFormat` as a plain JS object.
   */
  toJSObject(): DatabaseFormatSerialized {
    return {
      columnSeparator: this.columnSeparator,
      dateFormat: this.dateFormat,
      hasHeaderRow: this.hasHeaderRow,
      timezone: this.timezone,
      typeMap: Object.fromEntries(this.typeMap),
    };
  }

  /**
   * Pre-serialize the `DatabaseFormat` into an object ready to be turned into a JSON string.
   * @returns The `DatabaseFormat` as a JSON-serializable object.
   */
  toJSON() {
    return this.toJSObject();
  }
}
