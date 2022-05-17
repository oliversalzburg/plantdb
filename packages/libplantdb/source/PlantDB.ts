import { parse } from "csv-parse/browser/esm/sync";
import { DatabaseFormat } from "./DatabaseFormat.js";
import { LogEntry, LogEntrySerialized } from "./LogEntry.js";
import { Plant, PlantSerialized } from "./Plant.js";

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

  static Empty() {
    return new PlantDB();
  }

  withNewLog(log: ReadonlyArray<LogEntry>) {
    return PlantDB.fromPlantDB(this, { log });
  }

  static fromPlantDB(other: PlantDB, initializer?: Partial<PlantDB>) {
    const plantDb = new PlantDB();
    plantDb.#config = initializer?.config
      ? DatabaseFormat.fromDatabaseFormat(initializer.config)
      : DatabaseFormat.fromDatabaseFormat(other.#config);
    plantDb.#entryTypes = initializer?.entryTypes
      ? new Set(initializer.entryTypes)
      : new Set(other.#entryTypes);
    plantDb.#log = initializer?.log
      ? [...initializer.log]
      : other.#log.map(entry => LogEntry.fromLogEntry(entry));
    plantDb.#plants = initializer?.plants
      ? new Map(initializer.plants)
      : new Map(
          [...other.#plants.entries()].map(([plantId, plant]) => [plantId, Plant.fromPlant(plant)])
        );
    return plantDb;
  }

  static fromCSV(databaseFormat: DatabaseFormat, plantDataRaw: string, plantLogDataRaw: string) {
    const plantDb = new PlantDB();

    plantDb.#config = databaseFormat;

    const plantLogData = parse(plantLogDataRaw, {
      columns: false,
      delimiter: databaseFormat.columnSeparator,
      from: databaseFormat.hasHeaderRow ? 2 : 1,
    }) as Array<Array<string>>;
    for (const [index, logRecord] of plantLogData.entries()) {
      const logEntry = LogEntry.fromCSVData(logRecord, databaseFormat, index);
      plantDb.#log.push(logEntry);
      plantDb.#entryTypes.add(logEntry.type);
    }

    plantDb.#log.sort((a, b) => a.timestamp.valueOf() - b.timestamp.valueOf());

    const plantData = parse(plantDataRaw, {
      columns: false,
      delimiter: databaseFormat.columnSeparator,
      from: databaseFormat.hasHeaderRow ? 2 : 1,
    }) as Array<Array<string>>;
    for (const plantRecord of plantData) {
      const plant = Plant.fromCSV(plantRecord, plantDb.#log);
      plantDb.#plants.set(plant.id, plant);
    }

    // Create plants that appear on the log, but are not defined in the plant metadata.
    for (const log of plantDb.#log) {
      if (!plantDb.#plants.has(log.plantId)) {
        plantDb.#plants.set(log.plantId, Plant.fromJSObject({ id: log.plantId }, plantDb.#log));
      }
    }

    return plantDb;
  }

  static fromJSObjects(
    databaseFormat: DatabaseFormat,
    plants: Array<PlantSerialized>,
    plantLogData: Array<LogEntrySerialized>
  ) {
    const plantDb = new PlantDB();

    plantDb.#config = databaseFormat;
    plantDb.#log = plantLogData.map(logEntry => LogEntry.fromJSObject(logEntry));

    for (const logEntry of plantDb.#log) {
      plantDb.#entryTypes.add(logEntry.type);
    }

    for (const plant of plants) {
      plantDb.#plants.set(plant.id, Plant.fromJSObject(plant, plantDb.#log));
    }

    plantDb.#log.sort((a, b) => a.timestamp.valueOf() - b.timestamp.valueOf());

    return plantDb;
  }
}
