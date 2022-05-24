import { parse } from "csv-parse/browser/esm/sync";
import { DatabaseFormat, EventTypes } from "./DatabaseFormat.js";
import { LogEntry, LogEntrySerialized } from "./LogEntry.js";
import { Plant, PlantSerialized } from "./Plant.js";
import { logToCSV, makePlantMap, plantsToCSV } from "./Tools.js";

/**
 * The main entrypoint of a PlantDB data collection.
 */
export class PlantDB {
  /**
   * The configuration of this database.
   */
  #config = new DatabaseFormat();

  /**
   * The core data structure, our log of entries with plant information.
   */
  #log = new Array<LogEntry>();
  /**
   * Metadata to extend the log. This contains information about the plants themselves.
   */
  #plants = new Map<string, Plant>();

  // Data caches to help construct UI workflows.
  #entryTypes = new Set<string>();
  #kinds = new Set<string>();
  #locations = new Set<string>();
  #potColors = new Set<string>();
  #potShapes = new Set<string>();
  #substrates = new Set<string>();
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
   * A cache of all the user-supplied plant kinds in the database.
   */
  get kinds(): ReadonlySet<string> {
    return this.#kinds;
  }

  /**
   * A cache of all the user-supplied locations in the database.
   */
  get locations(): ReadonlySet<string> {
    return this.#locations;
  }

  /**
   * A cache of all the user-supplied pot colors in the database.
   */
  get potColors(): ReadonlySet<string> {
    return this.#potColors;
  }

  /**
   * A cache of all the user-supplied pot shapes in the database.
   */
  get potShapesTop(): ReadonlySet<string> {
    return this.#potShapes;
  }

  /**
   * A cache of all the user-supplied substrates in the database.
   */
  get substrates(): ReadonlySet<string> {
    return this.#substrates;
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
      plants.set(logEntry.plantId, Plant.fromJSObject(this, { id: logEntry.plantId }));
    }

    return PlantDB.fromPlantDB(this, { log, plants });
  }

  withUpdatedLogEntry(updatedLogEntry: LogEntry, oldLogEntry: LogEntry) {
    const plants = new Map(this.#plants);
    const log = [
      ...this.#log.filter(entry => entry !== oldLogEntry),
      LogEntry.fromLogEntry(updatedLogEntry, { plants }),
    ];

    if (!plants.has(updatedLogEntry.plantId)) {
      plants.set(
        updatedLogEntry.plantId,
        Plant.fromJSObject(this, { id: updatedLogEntry.plantId })
      );
    }

    return PlantDB.fromPlantDB(this, { log, plants });
  }

  withoutLogEntry(logEntry: LogEntry) {
    const log = [...this.#log.filter(entry => entry !== logEntry)];
    const plants = new Map(this.#plants);

    return PlantDB.fromPlantDB(this, { log, plants });
  }

  withUpdatedPlant(updatedPlant: Plant, oldPlant: Plant) {
    const log = [...this.#log];
    const plants = makePlantMap(
      [...this.#plants.values(), updatedPlant].filter(subject => subject !== oldPlant)
    );

    return PlantDB.fromPlantDB(this, { log, plants });
  }

  withoutPlant(plant: Plant) {
    const log = [...this.#log];
    const plants = makePlantMap([...this.#plants.values()].filter(subject => subject !== plant));

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
    const entry = LogEntry.fromJSObject(this, {
      sourceLine:
        0 < this.#log.length
          ? this.#log[this.#log.length - 1].sourceLine + 1
          : this.#config.hasHeaderRow
          ? 2
          : 1,
      plantId,
      timestamp: timestamp.toISOString(),
      type,
    });
    return entry;
  }

  /**
   * Creates a new plant that is to be added to the database.
   *
   * @param plantId The ID of the plant to create.
   * @returns The created `Plant`.
   */
  makeNewPlant(plantId: string) {
    const plant = Plant.fromJSObject(this, { id: plantId });
    return plant;
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
    plantDb.#log = (initializer?.log ?? other.#log).map(entry =>
      LogEntry.fromLogEntry(entry, { plantDb })
    );
    plantDb.#plants = new Map(
      [...(initializer?.plants ?? other.#plants).entries()].map(([plantId, plant]) => [
        plantId,
        Plant.fromPlant(plant, { plantDb }),
      ])
    );

    plantDb.#log.sort((a, b) => a.timestamp.valueOf() - b.timestamp.valueOf());

    plantDb.#entryTypes = PlantDB.aggregateEventTypes(plantDb);
    plantDb.#kinds = PlantDB.aggregateKinds(plantDb);
    plantDb.#locations = PlantDB.aggregateLocations(plantDb);
    plantDb.#potColors = PlantDB.aggregatePotColors(plantDb);
    plantDb.#potShapes = PlantDB.aggregatePotShapes(plantDb);
    plantDb.#substrates = PlantDB.aggregateSubstrates(plantDb);
    plantDb.#usedProducts = PlantDB.aggregateProductsUsed(plantDb);

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
      const logEntry = LogEntry.fromCSVData(plantDb, logRecord, databaseFormat, index + offset);
      plantDb.#log.push(logEntry);
    }

    plantDb.#log.sort((a, b) => a.timestamp.valueOf() - b.timestamp.valueOf());

    const plantData = parse(plantDataRaw, {
      columns: false,
      delimiter: databaseFormat.columnSeparator,
      from: databaseFormat.hasHeaderRow ? 2 : 1,
    }) as Array<Array<string>>;

    for (const plantRecord of plantData) {
      const plant = Plant.fromCSVData(plantDb, plantRecord);
      plantDb.#plants.set(plant.id, plant);
    }

    // Create plants that appear on the log, but are not defined in the plant metadata.
    for (const log of plantDb.#log) {
      if (!plantDb.#plants.has(log.plantId)) {
        plantDb.#plants.set(log.plantId, Plant.fromJSObject(plantDb, { id: log.plantId }));
      }
    }

    plantDb.#entryTypes = PlantDB.aggregateEventTypes(plantDb);
    plantDb.#kinds = PlantDB.aggregateKinds(plantDb);
    plantDb.#locations = PlantDB.aggregateLocations(plantDb);
    plantDb.#potColors = PlantDB.aggregatePotColors(plantDb);
    plantDb.#potShapes = PlantDB.aggregatePotShapes(plantDb);
    plantDb.#substrates = PlantDB.aggregateSubstrates(plantDb);
    plantDb.#usedProducts = PlantDB.aggregateProductsUsed(plantDb);

    return plantDb;
  }

  toCSV(databaseFormat = this.#config) {
    return {
      log: logToCSV(this.#log, databaseFormat),
      plants: plantsToCSV([...this.plants.values()], databaseFormat),
    };
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
    plants: Array<PlantSerialized> = [],
    plantLogData: Array<LogEntrySerialized> = []
  ) {
    const plantDb = new PlantDB();

    plantDb.#config = databaseFormat;
    plantDb.#log = plantLogData.map(logEntry => LogEntry.fromJSObject(plantDb, logEntry));

    for (const plant of plants) {
      plantDb.#plants.set(plant.id, Plant.fromJSObject(plantDb, plant));
    }

    plantDb.#log.sort((a, b) => a.timestamp.valueOf() - b.timestamp.valueOf());

    plantDb.#entryTypes = PlantDB.aggregateEventTypes(plantDb);
    plantDb.#kinds = PlantDB.aggregateKinds(plantDb);
    plantDb.#locations = PlantDB.aggregateLocations(plantDb);
    plantDb.#potColors = PlantDB.aggregatePotColors(plantDb);
    plantDb.#potShapes = PlantDB.aggregatePotShapes(plantDb);
    plantDb.#substrates = PlantDB.aggregateSubstrates(plantDb);
    plantDb.#usedProducts = PlantDB.aggregateProductsUsed(plantDb);

    return plantDb;
  }

  private static aggregateEventTypes(plantDb: PlantDB) {
    const eventTypes = new Set<string>();
    for (const logEntry of plantDb.#log) {
      eventTypes.add(logEntry.type);
    }
    return eventTypes;
  }
  private static aggregateKinds(plantDb: PlantDB) {
    const kinds = new Set<string>();
    for (const plant of plantDb.#plants.values()) {
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
  }
  private static aggregateLocations(plantDb: PlantDB) {
    const locations = new Set<string>();
    for (const plant of plantDb.#plants.values()) {
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
  }
  private static aggregatePotColors(plantDb: PlantDB) {
    const potColors = new Set<string>();
    for (const plant of plantDb.#plants.values()) {
      if (!plant.potColor) {
        continue;
      }
      potColors.add(plant.potColor);
    }
    return potColors;
  }
  private static aggregatePotShapes(plantDb: PlantDB) {
    const potShapes = new Set<string>();
    for (const plant of plantDb.#plants.values()) {
      if (!plant.potShapeTop) {
        continue;
      }
      potShapes.add(plant.potShapeTop);
    }
    return potShapes;
  }
  private static aggregateProductsUsed(plantDb: PlantDB) {
    const productsUsed = new Set<string>();
    for (const logEntry of plantDb.#log) {
      if (!logEntry.productUsed) {
        continue;
      }
      productsUsed.add(logEntry.productUsed);
    }
    return productsUsed;
  }
  private static aggregateSubstrates(plantDb: PlantDB) {
    const substrates = new Set<string>();
    for (const plant of plantDb.#plants.values()) {
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
  }
}
