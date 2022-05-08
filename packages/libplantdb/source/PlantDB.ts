import { DatabaseFormat } from "./DatabaseFormat.js";
import { LogEntry } from "./LogEntry.js";
import { Plant } from "./Plant.js";

export class PlantDB {
  #config = new DatabaseFormat();
  #plants = new Map<string, Plant>();
  #log = new Array<LogEntry>();
  #entryTypes = new Set<string>();

  get config() {
    return this.#config;
  }

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

    plantDb.#config = databaseFormat;

    for (const logRecord of plantLogData) {
      const logEntry = LogEntry.deserialize(logRecord, databaseFormat);
      plantDb.#log.push(logEntry);
      plantDb.#entryTypes.add(logEntry.type);
    }

    plantDb.#log.sort((a, b) => a.timestamp.valueOf() - b.timestamp.valueOf());

    for (const plantRecord of plantData) {
      const initialParse = Plant.deserialize(plantRecord);
      const plant = Plant.deserialize(plantRecord, plantDb.#log);
      plantDb.#plants.set(initialParse.id, plant);
    }

    return plantDb;
  }
}
