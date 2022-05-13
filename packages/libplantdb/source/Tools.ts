import { EventType } from "./DatabaseFormat";
import { PlantDB } from "./PlantDB";

/**
 * Summarize the kinds in a plant.
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
 * @param input A number to round.
 * @param digits The amount of digits to round to.
 * @returns The input number rounded to the given number of digits.
 */
export const roundTo = (input: number, digits = 2) => {
  const power = Math.pow(10, digits);
  return Math.round(input * power) / power;
};
