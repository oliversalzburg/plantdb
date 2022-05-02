import { DatabaseFormat } from "./DatabaseFormat";
import { LogEntry } from "./LogEntry";
import { Plant } from "./Plant";

export class PlantDB {
  #plants = new Map<string, Plant>();
  #log = new Array<LogEntry>();

  get plants() {
    return this.#plants;
  }

  get log() {
    return this.#log;
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
    }

    plantDb.#log.sort((a, b) => a.timestamp.valueOf() - b.timestamp.valueOf());

    return plantDb;
  }
}
