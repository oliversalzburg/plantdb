import { parse } from "csv-parse/browser/esm/sync";
import { stringify } from "csv-stringify/browser/esm/sync";
import { DatabaseFormat, EventType } from "./DatabaseFormat";
import { LogEntry } from "./LogEntry";
import { Plant } from "./Plant";
import { PlantDB } from "./PlantDB";

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

export const makePlantMap = (plants: ReadonlyArray<Plant>) => {
  return new Map(plants.map(plant => [plant.id, plant]));
};
