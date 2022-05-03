import { DatabaseFormat } from "./DatabaseFormat.js";
import { LogEntry } from "./LogEntry.js";
import { Plant } from "./Plant.js";

export class PlantDB {
  #plants = new Map<string, Plant>();
  #log = new Array<LogEntry>();
  #entryTypes = new Set<string>();

  get plants(): ReadonlyMap<string, Plant> {
    return this.#plants;
  }

  get log(): ReadonlyArray<LogEntry> {
    return this.#log;
  }

  get entryTypes(): ReadonlySet<string> {
    return this.#entryTypes;
  }

  static deserialize(
    databaseFormat: DatabaseFormat,
    plantData: Array<Array<string>>,
    plantLogData: Array<Array<string>>
  ) {
    const plantDb = new PlantDB();

    for (const plantRecord of plantData) {
      const plant = Plant.deserialize(plantRecord);
      plantDb.#plants.set(plant.id, plant);
    }
    for (const logRecord of plantLogData) {
      const logEntry = LogEntry.deserialize(logRecord, databaseFormat);
      plantDb.#log.push(logEntry);
      plantDb.#entryTypes.add(logEntry.type);
    }

    plantDb.#log.sort((a, b) => a.timestamp.valueOf() - b.timestamp.valueOf());

    return plantDb;
  }
}
