import { parse } from "csv-parse/browser/esm/sync";
import { stringify } from "csv-stringify/browser/esm/sync";
import { DatabaseFormat } from "../DatabaseFormat";
import { LogEntry } from "../LogEntry";
import { Plant } from "../Plant";
import { PlantDB } from "../PlantDB";

/**
 * Serialize a log to CSV.
 *
 * @param log The log to serialize
 * @param databaseFormat The format to use when serializing values.
 * @returns The log as a CSV string.
 */
export const logToCSV = (log: Array<LogEntry>, databaseFormat: DatabaseFormat) => {
  return stringify(
    log.map(logEntry => logEntry.toCSVData(databaseFormat)),
    { delimiter: databaseFormat.columnSeparator }
  );
};

/**
 * Deserialize a CSV string into a plant log.
 *
 * @param plantDb The `PlantDB` this log should be placed in.
 * @param logCSV The CSV data to deserialize.
 * @param databaseFormat The format to use when interpreting values.
 * @returns An array of log entries.
 */
export const logFromCSV = (plantDb: PlantDB, logCSV: string, databaseFormat: DatabaseFormat) => {
  const plantLogData = parse(logCSV, {
    columns: false,
    delimiter: databaseFormat.columnSeparator,
    from: databaseFormat.hasHeaderRow ? 2 : 1,
  }) as Array<Array<string>>;
  return plantLogData.map((logEntry, index) =>
    LogEntry.fromCSVData(plantDb, logEntry, databaseFormat, index)
  );
};

/**
 * Serialize plants to CSV.
 *
 * @param plants The plants to serialize
 * @param databaseFormat The format to use when serializing values.
 * @returns The log as a CSV string.
 */
export const plantsToCSV = (plants: Array<Plant>, databaseFormat: DatabaseFormat) => {
  return stringify(
    plants.map(plant => plant.toCSVData(databaseFormat)),
    { delimiter: databaseFormat.columnSeparator }
  );
};

/**
 * Deserialize a CSV string into a list of plants.
 *
 * @param plantDb The `PlantDB` the plants should be placed in.
 * @param plantCSV The CSV data to deserialize.
 * @param databaseFormat The format to use when interpreting values.
 * @returns An array of plants.
 */
export const plantsFromCSV = (
  plantDb: PlantDB,
  plantCSV: string,
  databaseFormat: DatabaseFormat
) => {
  const plantData = parse(plantCSV, {
    columns: false,
    delimiter: databaseFormat.columnSeparator,
    from: databaseFormat.hasHeaderRow ? 2 : 1,
  }) as Array<Array<string>>;
  return plantData.map(plantRecord => Plant.fromCSVData(plantDb, plantRecord));
};

/**
 * Split the provided value into an array of strings, if it contains multiple lines of text.
 *
 * @param multiValue A string that potentially holds multiple lines of text.
 * @returns A single string if the column contained a single line. An array of strings of the column contained multiple lines.
 */
export const splitMultiValue = (multiValue: string) => {
  return multiValue.includes("\n") ? multiValue.split("\n") : multiValue;
};

/**
 * Retrieve the value from a specific column in CSV data.
 * If the column contains no readable value, it is treated as `undefined`.
 *
 * @param csvData CSV data that has already been parsed into individual columns.
 * @param column The index of the column to retrieve.
 * @param expectMultiValue Should multiple lines of strings be treated as individual values (true)
 * or as a single multi-line string (false)?
 * @returns The correctly parsed CSV value.
 */
export const valueFromCSV = (
  csvData: ReadonlyArray<string>,
  column: number,
  expectMultiValue = true
) => {
  // Falsey check covers empty string, null, undefined.
  if (!csvData[column]) {
    return undefined;
  }

  return expectMultiValue ? splitMultiValue(csvData[column]) : csvData[column];
};

/**
 * Retrieve a float value from a specific column in CSV data.
 * If the column contains no readable value, it is treated as `undefined`.
 *
 * @param csvData CSV data that has already been parsed into individual columns.
 * @param column The index of the column to retrieve.
 * @param databaseFormat The `DatabaseFormat` to be used to interpret the data.
 * @returns The correctly parsed CSV value.
 */
export const floatFromCSV = (
  csvData: ReadonlyArray<string>,
  column: number,
  databaseFormat: DatabaseFormat
) => {
  const value = valueFromCSV(csvData, column, false) as string;
  if (value === undefined) {
    return undefined;
  }

  const float = tryParseFloat(value, databaseFormat);
  return float;
};

/**
 * Retrieve an integer value from a specific column in CSV data.
 * If the column contains no readable value, it is treated as `undefined`.
 *
 * @param csvData CSV data that has already been parsed into individual columns.
 * @param column The index of the column to retrieve.
 * @param databaseFormat The `DatabaseFormat` to be used to interpret the data.
 * @returns The correctly parsed CSV value.
 */
export const intFromCSV = (
  csvData: ReadonlyArray<string>,
  column: number,
  databaseFormat: DatabaseFormat
) => {
  const value = valueFromCSV(csvData, column, false) as string;
  if (value === undefined) {
    return undefined;
  }

  const float = tryParseInt(value, databaseFormat);
  return float;
};

/**
 * Retrieve a boolean value from a specific column in CSV data.
 * If the column contains no readable value, it is treated as `undefined`.
 *
 * @param csvData CSV data that has already been parsed into individual columns.
 * @param column The index of the column to retrieve.
 * @returns The correctly parsed CSV value.
 */
export const boolFromCSV = (csvData: ReadonlyArray<string>, column: number) => {
  const value = valueFromCSV(csvData, column, false) as string;
  if (value === undefined) {
    return undefined;
  }

  const bool = tryParseBool(value);
  return bool;
};

/**
 * Turn a data value into a single string that we can serialize to CSV.
 *
 * @param value The value to prepare for CSV serialization.
 * @returns A single string containing all the provided values.
 */
export const valueToCSV = (value?: string | Array<string>) => {
  if (value === undefined) {
    return "";
  }

  return Array.isArray(value) ? value.join("\n") : value;
};

/**
 * Given a string from a CSV source, determine which boolean value it represents.
 *
 * @param boolValue A string describing a boolean value.
 * @returns The boolean meaning of the passed value, or `undefined`.
 */
export const tryParseBool = (boolValue: string) => {
  if (boolValue === "TRUE") {
    return true;
  }
  if (boolValue === "FALSE") {
    return false;
  }
  return undefined;
};

/**
 * Given a string from a CSV source, determine which float value it represents.
 *
 * @param numberValue A string describing a number value.
 * @param databaseFormat The `DatabaseFormat` to be used to interpret the data.
 * @returns The float value of the passed value, or `undefined`.
 */
export const tryParseFloat = (numberValue: string, databaseFormat = new DatabaseFormat()) => {
  if (numberValue.includes(databaseFormat.decimalSeparator)) {
    const parts = numberValue.split(databaseFormat.decimalSeparator);
    if (parts.length !== 2) {
      return undefined;
    }
    const partInteger = parts[0].replace(/[^0-9]/, "");
    const partDecimal = parts[1].replace(/[^0-9]/, "");
    return Number.parseFloat(`${partInteger}.${partDecimal}`);
  }

  if (Number.isNaN(+numberValue) || Number.isNaN(parseFloat(numberValue))) {
    return undefined;
  }

  return Number.parseFloat(numberValue);
};

/**
 * Given a string from a CSV source, determine which integer value it represents.
 *
 * @param numberValue A string describing a number value.
 * @param databaseFormat The `DatabaseFormat` to be used to interpret the data.
 * @returns The integer value of the passed value, or `undefined`.
 */
export const tryParseInt = (numberValue: string, databaseFormat = new DatabaseFormat()) => {
  if (numberValue.includes(databaseFormat.decimalSeparator)) {
    const parts = numberValue.split(databaseFormat.decimalSeparator);
    if (parts.length !== 2) {
      return undefined;
    }
    const partInteger = parts[0].replace(/[^0-9]/, "");
    const partDecimal = parts[1].replace(/[^0-9]/, "");
    return Number.parseInt(`${partInteger}.${partDecimal}`);
  }

  if (Number.isNaN(+numberValue) || Number.isNaN(parseFloat(numberValue))) {
    return undefined;
  }

  return Number.parseInt(numberValue);
};
