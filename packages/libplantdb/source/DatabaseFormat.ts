import { PlantDBEntity } from "./PlantDBEntity.js";

/**
 * Describes a plain JS object, containing all the properties required to initialize
 * a `DatabaseFormat`.
 */
export interface DatabaseFormatSerialized {
  columnSeparator: string;
  dateFormat: string;
  decimalSeparator: string;
  hasHeaderRow: boolean;
  timezone: string;
}

/**
 * Describes the format of records in a PlantDB document.
 */
export class DatabaseFormat extends PlantDBEntity {
  #columnSeparator = ",";
  #dateFormat = "yyyy-MM-dd HH:mm";
  #decimalSeparator = ".";
  #hasHeaderRow = true;
  #timezone = "utc";

  /**
   * The character separating the individual columns of values in the document.
   */
  get columnSeparator() {
    return this.#columnSeparator;
  }

  /**
   * The format that is used to record date/time values in the document.
   *
   * @see https://moment.github.io/luxon/#/parsing?id=table-of-tokens
   */
  get dateFormat() {
    return this.#dateFormat;
  }

  /**
   * The character separating the integer from the decimal part in a number.
   */
  get decimalSeparator() {
    return this.#decimalSeparator;
  }

  /**
   * Whether this document has an initial row that contains the labels for the columns in the document.
   */
  get hasHeaderRow() {
    return this.#hasHeaderRow;
  }

  /**
   * The time zone in which the date/time values in the document were recorded.
   *
   * @see https://moment.github.io/luxon/#/zones?id=specifying-a-zone
   */
  get timezone() {
    return this.#timezone;
  }

  private constructor() {
    super();
  }

  /**
   * A safe default database format that should be preferred when dealing with data
   * that should be exchanged with other PlantDB applications.
   *
   * @returns A database format designed for highest possible interoperability.
   */
  static DefaultInterchange() {
    return new DatabaseFormat();
  }

  /**
   * Creates a new `DatabaseFormat`, with the values of another `DatabaseFormat`.
   *
   * @param other The `DatabaseFormat` to copy values from.
   * @returns The new `DatabaseFormat`.
   */
  static fromDatabaseFormat(other: DatabaseFormat) {
    const format = new DatabaseFormat();
    format.#columnSeparator = other.#columnSeparator;
    format.#dateFormat = other.#dateFormat;
    format.#decimalSeparator = other.#decimalSeparator;
    format.#hasHeaderRow = other.#hasHeaderRow;
    format.#timezone = other.#timezone;
    return format;
  }

  /**
   * Parse a JS object and construct a new `DatabaseFormat` from it.
   *
   * @param data The serialized `DatabaseFormat`.
   * @returns The new `DatabaseFormat`.
   */
  static fromJSObject(data: Partial<DatabaseFormatSerialized>) {
    const format = new DatabaseFormat();
    format.#columnSeparator = data.columnSeparator ?? format.#columnSeparator;
    format.#dateFormat = data.dateFormat ?? format.#dateFormat;
    format.#decimalSeparator = data.decimalSeparator ?? format.#decimalSeparator;
    format.#hasHeaderRow = data.hasHeaderRow ?? format.#hasHeaderRow;
    format.#timezone = data.timezone ?? format.#timezone;
    return format;
  }

  /**
   * Parse a JSON string and construct a new `DatabaseFormat` from it.
   *
   * @param dataString The JSON-serialized database format.
   * @returns The new `DatabaseFormat`.
   */
  static fromJSON(dataString: string) {
    const data = JSON.parse(dataString) as Partial<DatabaseFormatSerialized>;
    return DatabaseFormat.fromJSObject(data);
  }

  /**
   * Convert the `DatabaseFormat` into a plain JS object.
   *
   * @returns The `DatabaseFormat` as a plain JS object.
   */
  toJSObject(): DatabaseFormatSerialized {
    return {
      columnSeparator: this.columnSeparator,
      dateFormat: this.dateFormat,
      decimalSeparator: this.decimalSeparator,
      hasHeaderRow: this.hasHeaderRow,
      timezone: this.timezone,
    };
  }

  /** @inheritDoc */
  override toJSON() {
    return this.toJSObject();
  }
}
