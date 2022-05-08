import { EventType } from "./DatabaseFormat";
import { PlantDB } from "./PlantDB";

export const kindSummarize = (plantKind: string | string[] | undefined) => {
  if (plantKind === undefined) {
    return "<unknown kind>";
  }

  if (Array.isArray(plantKind)) {
    return `${plantKind.length} kinds`;
  }

  return plantKind;
};

export const kindFlatten = (plantKind: string | string[] | undefined) => {
  if (plantKind === undefined) {
    return "<unknown kind>";
  }

  if (Array.isArray(plantKind)) {
    return plantKind.join(", ");
  }

  return plantKind;
};

export const identifyLogType = (entryType: string, plantDb: PlantDB): EventType | undefined => {
  if (!plantDb.config.typeMap.has(entryType)) {
    return undefined;
  }

  return plantDb.config.typeMap.get(entryType) as EventType;
};
