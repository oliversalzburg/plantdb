import { parse } from "csv-parse/browser/esm/sync";
import { stringify } from "csv-stringify/browser/esm/sync";
import { DatabaseFormat, EventType } from "./DatabaseFormat.js";
import { LogEntry } from "./LogEntry.js";
import { Plant } from "./Plant.js";
import { PlantDB } from "./PlantDB.js";

/**
 * Summarize the kinds in a plant.
 *
 * @param plantKind A `kind` of a `Plant`
 * @returns A string that summarizes the kinds in a plant.
 */
export const kindSummarize = (plantKind: string | string[] | undefined) => {
  if (plantKind === undefined) {
    return "<unknown kind>";
  }

  if (Array.isArray(plantKind)) {
    return `${plantKind.length} kinds`;
  }

  return plantKind;
};

/**
 * Add all the kinds of a plant into a single string.
 *
 * @param plantKind A `kind` if a `Plant`.
 * @returns A string that contains all the kinds the plant.
 */
export const kindFlatten = (plantKind: string | string[] | undefined) => {
  if (plantKind === undefined) {
    return "<unknown kind>";
  }

  if (Array.isArray(plantKind)) {
    return plantKind.join(", ");
  }

  return plantKind;
};

/**
 * Identify a user-given event type to an internally-known one, based on the information found in a `PlantDB`.
 *
 * @param entryType A type of event as it's given in user-supplied data.
 * @param plantDb The plant database that it is found in.
 * @returns The internally-known event type for the user-given event type.
 */
export const identifyLogType = (entryType: string, plantDb: PlantDB): EventType | undefined => {
  if (!plantDb.config.typeMap.has(entryType)) {
    return undefined;
  }

  return plantDb.config.typeMap.get(entryType) as EventType;
};

/**
 * Round a number to a given number of digits.
 *
 * @param input A number to round.
 * @param digits The amount of digits to round to.
 * @returns The input number rounded to the given number of digits.
 */
export const roundTo = (input: number, digits = 2) => {
  const power = Math.pow(10, digits);
  return Math.round(input * power) / power;
};

export const logToCSV = (log: Array<LogEntry>, databaseFormat: DatabaseFormat) => {
  return stringify(
    log.map(logEntry => logEntry.toCSVData(databaseFormat)),
    { delimiter: databaseFormat.columnSeparator }
  );
};

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

export const plantsToCSV = (plants: Array<Plant>, databaseFormat: DatabaseFormat) => {
  return stringify(
    plants.map(plant => plant.toCSVData(databaseFormat)),
    { delimiter: databaseFormat.columnSeparator }
  );
};

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
 * Split the provided value into an array of strings, if it contains multiple lines of text.
 *
 * @param multiValue A string that potentially holds multiple lines of text.
 * @returns A single string if the column contained a single line. An array of strings of the column contained multiple lines.
 */
export const splitMultiValue = (multiValue: string) => {
  return multiValue.includes("\n") ? multiValue.split("\n") : multiValue;
};

/**
 * Turn an array of plants into a map that maps their IDs to the respective plant.
 *
 * @param plants The plants to turn into a `Map`.
 * @returns A `Map` that maps plant IDs to their respective plant.
 */
export const makePlantMap = (plants: ReadonlyArray<Plant>) => {
  return new Map(plants.map(plant => [plant.id, plant]));
};

export const tryParseBool = (boolValue: string) => {
  if (boolValue === "TRUE") {
    return true;
  }
  if (boolValue === "FALSE") {
    return false;
  }
  return undefined;
};

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
