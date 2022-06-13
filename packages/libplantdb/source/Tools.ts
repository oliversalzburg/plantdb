import { EventType } from "./DatabaseFormat.js";
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

export const flattenMultiValue = (multiValue: string | string[] | undefined) => {
  if (multiValue === undefined) {
    return "";
  }

  if (Array.isArray(multiValue)) {
    return multiValue.join(", ");
  }

  return multiValue;
};

/**
 * Identify a user-given event type to an internally-known one, based on the information found in a `PlantDB`.
 *
 * @param entryType A type of event as it's given in user-supplied data.
 * @param plantDb The plant database that it is found in.
 * @returns The internally-known event type for the user-given event type.
 */
export const identifyLogType = (entryType: string, plantDb: PlantDB): EventType | undefined => {
  if (!plantDb.databaseFormat.typeMap.has(entryType)) {
    return undefined;
  }

  return plantDb.databaseFormat.typeMap.get(entryType) as EventType;
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

/**
 * Turn an array of plants into a map that maps their IDs to the respective plant.
 *
 * @param plants The plants to turn into a `Map`.
 * @returns A `Map` that maps plant IDs to their respective plant.
 */
export const makePlantMap = (plants: ReadonlyArray<Plant>) => {
  return new Map(plants.map(plant => [plant.id, plant]));
};

export const aggregateEventTypes = (log: ReadonlyArray<LogEntry>) => {
  const eventTypes = new Set<string>();
  for (const logEntry of log) {
    eventTypes.add(logEntry.type);
  }
  return eventTypes;
};
export const aggregateKinds = (plants: ReadonlyArray<Plant>) => {
  const kinds = new Set<string>();
  for (const plant of plants) {
    if (!plant.kind) {
      continue;
    }
    if (Array.isArray(plant.kind)) {
      plant.kind.forEach(kind => kinds.add(kind));
    } else {
      kinds.add(plant.kind);
    }
  }
  return kinds;
};
export const aggregateLocations = (plants: ReadonlyArray<Plant>) => {
  const locations = new Set<string>();
  for (const plant of plants) {
    if (!plant.location) {
      continue;
    }
    if (Array.isArray(plant.location)) {
      plant.location.forEach(location => locations.add(location));
    } else {
      locations.add(plant.location);
    }
  }
  return locations;
};
export const aggregatePotColors = (plants: ReadonlyArray<Plant>) => {
  const potColors = new Set<string>();
  for (const plant of plants) {
    if (!plant.potColor) {
      continue;
    }
    potColors.add(plant.potColor);
  }
  return potColors;
};
export const aggregatePotShapes = (plants: ReadonlyArray<Plant>) => {
  const potShapes = new Set<string>();
  for (const plant of plants) {
    if (!plant.potShapeTop) {
      continue;
    }
    potShapes.add(plant.potShapeTop);
  }
  return potShapes;
};
export const aggregateProductsUsed = (log: ReadonlyArray<LogEntry>) => {
  const productsUsed = new Set<string>();
  for (const logEntry of log) {
    if (!logEntry.productUsed) {
      continue;
    }
    if (Array.isArray(logEntry.productUsed)) {
      logEntry.productUsed.forEach(productUsed => productsUsed.add(productUsed));
    } else {
      productsUsed.add(logEntry.productUsed);
    }
  }
  return productsUsed;
};
export const aggregateSubstrates = (plants: ReadonlyArray<Plant>) => {
  const substrates = new Set<string>();
  for (const plant of plants) {
    if (!plant.substrate) {
      continue;
    }
    if (Array.isArray(plant.substrate)) {
      plant.substrate.forEach(substrate => substrates.add(substrate));
    } else {
      substrates.add(plant.substrate);
    }
  }
  return substrates;
};
