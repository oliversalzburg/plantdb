import { parse } from "csv-parse/browser/esm/sync";
import { DatabaseFormat, EventTypes } from "./DatabaseFormat.js";
import { LogEntry, LogEntrySerialized } from "./LogEntry.js";
import { Plant, PlantSerialized } from "./Plant.js";

/**
 * The main entrypoint of a PlantDB data collection.
 */
export class PlantDB {
  #config = new DatabaseFormat();
  #plants = new Map<string, Plant>();
  #log = new Array<LogEntry>();
  #entryTypes = new Set<string>();
  #usedProducts = new Set<string>();

  /**
   * The `DatabaseFormat` used to initialize this database.
   */
  get config() {
    return this.#config;
  }

  /**
   * A map of plants that are found within the database.
   * It maps Plant IDs (like "PID-12") to the actual `Plant`.
   * If you only want the plants themselves, use `plants.values()`.
   */
  get plants(): ReadonlyMap<string, Plant> {
    return this.#plants;
  }

  /**
   * The individual log entries, sorted by their timestamp, starting with the oldest.
   */
  get log(): ReadonlyArray<LogEntry> {
    return this.#log;
  }

  /**
   * A cache of all the user-supplied event types in the database.
   */
  get entryTypes(): ReadonlySet<string> {
    return this.#entryTypes;
  }

  /**
   * A cache of all the user-supplied products in the database.
   */
  get usedProducts(): ReadonlySet<string> {
    return this.#usedProducts;
  }

  /**
   * Returns an empty `PlantDB`.
   */
  static Empty() {
    return new PlantDB();
  }

  /**
   * Returns a copy of this `PlantDB`, but with an entirely new log.
   *
   * @param log The new log for the database.
   * @returns The new `PlantDB`.
   */
  withNewLog(log: ReadonlyArray<LogEntry>) {
    return PlantDB.fromPlantDB(this, { log });
  }

  /**
   * Returns a copy of this `PlantDB`, but with a new entry added to its log.
   *
   * If the referenced plant does not exist, it will be created in the new database.
   *
   * @param logEntry The log entry to add to the database.
   * @returns The new `PlantDB`.
   */
  withNewLogEntry(logEntry: LogEntry) {
    const plants = new Map(this.#plants);
    const log = [...this.#log, LogEntry.fromLogEntry(logEntry, { plants })];

    if (!plants.has(logEntry.plantId)) {
      plants.set(logEntry.plantId, Plant.fromJSObject({ id: logEntry.plantId }, log));
    }

    return PlantDB.fromPlantDB(this, { log, plants });
  }

  /**
   * Creates a new log entry that is to be added to the database.
   *
   * @param plantId The ID of the plant for which this is a new log entry.
   * @param timestamp THe date and time this event was recorded at.
   * @param type The type of the event.
   * @returns The created `LogEntry`.
   */
  makeNewLogEntry(
    plantId: string,
    timestamp: Date = new Date(),
    type: string = EventTypes.Observation
  ) {
    const entry = new LogEntry(
      0 < this.#log.length
        ? this.#log[this.#log.length - 1].sourceLine + 1
        : this.#config.hasHeaderRow
        ? 2
        : 1,
      plantId,
      timestamp,
      type,
      this.#plants
    );
    return entry;
  }

  /**
   * Construct a new PlantDB, based on the data in another one, and also optionally override
   * some of its properties.
   *
   * @param other The `PlantDB` to initialize the new one from.
   * @param initializer A hash that contains additional fields to copy into the new instance.
   * @returns A new `PlantDB` with the provided arguments merged into it.
   */
  static fromPlantDB(other: PlantDB, initializer?: Partial<PlantDB>) {
    const plantDb = new PlantDB();
    plantDb.#config = initializer?.config
      ? DatabaseFormat.fromDatabaseFormat(initializer.config)
      : DatabaseFormat.fromDatabaseFormat(other.#config);
    plantDb.#entryTypes = initializer?.entryTypes
      ? new Set(initializer.entryTypes)
      : new Set(other.#entryTypes);
    plantDb.#usedProducts = initializer?.usedProducts
      ? new Set(initializer.usedProducts)
      : new Set(other.#usedProducts);
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

  /**
   * Constructs a new `PlantDB` based on information found in CSV data.
   *
   * @param databaseFormat The `DatabaseFormat` that explains how to interpret the data.
   * @param plantDataRaw The raw plant CSV data.
   * @param plantLogDataRaw The raw plant log CSV data.
   * @returns A new `PlantDB` with the information found in the CSV data.
   */
  static fromCSV(databaseFormat: DatabaseFormat, plantDataRaw: string, plantLogDataRaw: string) {
    const plantDb = new PlantDB();

    plantDb.#config = databaseFormat;

    const plantLogData = parse(plantLogDataRaw, {
      columns: false,
      delimiter: databaseFormat.columnSeparator,
      from: databaseFormat.hasHeaderRow ? 2 : 1,
    }) as Array<Array<string>>;
    const offset = databaseFormat.hasHeaderRow ? 2 : 1;
    for (const [index, logRecord] of plantLogData.entries()) {
      const logEntry = LogEntry.fromCSVData(
        logRecord,
        databaseFormat,
        index + offset,
        plantDb.plants
      );
      plantDb.#log.push(logEntry);
      plantDb.#entryTypes.add(logEntry.type);
      if (logEntry.productUsed) {
        plantDb.#usedProducts.add(logEntry.productUsed);
      }
    }

    plantDb.#log.sort((a, b) => a.timestamp.valueOf() - b.timestamp.valueOf());

    const plantData = parse(plantDataRaw, {
      columns: false,
      delimiter: databaseFormat.columnSeparator,
      from: databaseFormat.hasHeaderRow ? 2 : 1,
    }) as Array<Array<string>>;
    for (const plantRecord of plantData) {
      const plant = Plant.fromCSVData(plantRecord, plantDb.#log);
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

  /**
   * Constructs a new `PlantDB` based on some plain JavaScript initialization hashes.
   *
   * @param databaseFormat The `DatabaseFormat` to use for the new database.
   * @param plants The plants to put into the database.
   * @param plantLogData The log data to put into the database.
   * @returns A new `PlantDB` initialized with the given data.
   */
  static fromJSObjects(
    databaseFormat: DatabaseFormat,
    plants: Array<PlantSerialized>,
    plantLogData: Array<LogEntrySerialized>
  ) {
    const plantDb = new PlantDB();

    plantDb.#config = databaseFormat;
    plantDb.#log = plantLogData.map(logEntry => LogEntry.fromJSObject(logEntry, plantDb.plants));

    for (const logEntry of plantDb.#log) {
      plantDb.#entryTypes.add(logEntry.type);
      if (logEntry.productUsed) {
        plantDb.#usedProducts.add(logEntry.productUsed);
      }
    }

    for (const plant of plants) {
      plantDb.#plants.set(plant.id, Plant.fromJSObject(plant, plantDb.#log));
    }

    plantDb.#log.sort((a, b) => a.timestamp.valueOf() - b.timestamp.valueOf());

    return plantDb;
  }
}
