export class DatabaseFormat {
  #columnSeparator = "\t";
  #dateFormat = "yyyy-MM-dd hh:mm:ss";
  #hasHeaderRow = true;
  #timezone = "utc";

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

  static deserialize(data: DatabaseFormat) {
    const format = new DatabaseFormat();
    format.#columnSeparator = data.columnSeparator;
    format.#dateFormat = data.dateFormat;
    format.#hasHeaderRow = data.hasHeaderRow;
    return format;
  }
}
