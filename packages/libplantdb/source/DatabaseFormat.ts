export type EventType =
  /**
   * Typically, this marks the first event of a plant, if that plant was acquired (purchased) from a vendor.
   */
  | "Acquisition"
  /**
   * A plant was fertilized.
   */
  | "Fertilization"
  /**
   * A measurement has been taken from the plant.
   */
  | "Measurement"
  /**
   * Something not further categorizable has been observed about the plant.
   */
  | "Observation"
  /**
   * A pest situation has been acted on.
   */
  | "Pest Control"
  /**
   * A pest situation has been identified.
   */
  | "Pest Infestation"
  /**
   * Branches have been pruned.
   */
  | "Pruning"
  /**
   * Plant was moved from one location to another one.
   */
  | "Relocation"
  /**
   * Plant was put into a (new) pot. Usually also marks the first event of a plant that was created from a cutting.
   */
  | "Repotting"
  /**
   * Roots have been pruned.
   */
  | "Root pruning"
  /**
   * The plant was shaped. For example, through wiring branches. Not to be confused with Pruning.
   */
  | "Shaping";

export type DatabaseFormatSerialized = {
  columnSeparator: string;
  dateFormat: string;
  hasHeaderRow: boolean;
  timezone: string;
  typeMap: Record<string, string>;
};

export class DatabaseFormat {
  #columnSeparator = "\t";
  #dateFormat = "yyyy-MM-dd hh:mm:ss";
  #hasHeaderRow = true;
  #timezone = "utc";
  #typeMap = new Map<string, string>();

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
