export class DatabaseFormat {
  #columnSeparator = "\t";
  #dateFormat = "MM/dd/YYYY hh:mm:ss";
  #hasHeaderRow = true;
  #timezone = "UTC";

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

  static deserialize(data: DatabaseFormat) {
    const format = new DatabaseFormat();
    format.#columnSeparator = data.columnSeparator;
    format.#dateFormat = data.dateFormat;
    format.#hasHeaderRow = data.hasHeaderRow;
    return format;
  }
}
