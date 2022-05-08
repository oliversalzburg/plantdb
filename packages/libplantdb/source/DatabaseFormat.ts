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

export type EventType = typeof EventTypes[keyof typeof EventTypes];

export type DatabaseFormatSerialized = {
  columnSeparator: string;
  dateFormat: string;
  hasHeaderRow: boolean;
  timezone: string;
  typeMap: Record<string, EventType>;
};

export class DatabaseFormat {
  #columnSeparator = "\t";
  #dateFormat = "yyyy-MM-dd hh:mm:ss";
  #hasHeaderRow = true;
  #timezone = "utc";
  #typeMap = new Map<string, EventType>();

  get columnSeparator() {
    return this.#columnSeparator;
  }

  /**
   * @see https://moment.github.io/luxon/#/parsing?id=table-of-tokens
   */
  get dateFormat() {
    return this.#dateFormat;
  }

  get hasHeaderRow() {
    return this.#hasHeaderRow;
  }

  /**
   * @see https://moment.github.io/luxon/#/zones?id=specifying-a-zone
   */
  get timezone() {
    return this.#timezone;
  }

  get typeMap() {
    return this.#typeMap;
  }

  withNewTypeMap(typeMap: Map<string, EventType>) {
    const copy = DatabaseFormat.fromDatabaseFormat(this);
    copy.#typeMap = typeMap;
    return copy;
  }

  static fromDatabaseFormat(other: DatabaseFormat) {
    const format = new DatabaseFormat();
    format.#columnSeparator = other.#columnSeparator;
    format.#dateFormat = other.#dateFormat;
    format.#hasHeaderRow = other.#hasHeaderRow;
    format.#timezone = other.#timezone;
    format.#typeMap = new Map(other.#typeMap);
    return format;
  }

  static fromJSON(data: Partial<DatabaseFormatSerialized>) {
    const format = new DatabaseFormat();
    format.#columnSeparator = data.columnSeparator ?? format.#columnSeparator;
    format.#dateFormat = data.dateFormat ?? format.#dateFormat;
    format.#hasHeaderRow = data.hasHeaderRow ?? format.#hasHeaderRow;
    format.#timezone = data.timezone ?? format.#timezone;

    format.#typeMap = new Map(Object.entries(data.typeMap ?? {}));
    return format;
  }

  toJSON(): DatabaseFormatSerialized {
    return {
      columnSeparator: this.columnSeparator,
      dateFormat: this.dateFormat,
      hasHeaderRow: this.hasHeaderRow,
      timezone: this.timezone,
      typeMap: Object.fromEntries(this.typeMap),
    };
  }
}
