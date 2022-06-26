import { parse } from "csv-parse/browser/esm/sync";
import { logToCSV, plantsToCSV } from "./csv/Tools";
import { DatabaseFormat, EventTypes } from "./DatabaseFormat";
import { LogEntry, LogEntrySerialized } from "./LogEntry";
import { Plant, PlantSerialized } from "./Plant";
import { Task, TaskSerialized } from "./Task";
import {
  aggregateEventTypes,
  aggregateKinds,
  aggregateLocations,
  aggregatePotColors,
  aggregatePotShapes,
  aggregateProductsUsed,
  aggregateSubstrates,
  makePlantMap,
} from "./Tools";

/**
 * The main entrypoint of a PlantDB data collection.
 */
export class PlantDB {
  #databaseFormat = DatabaseFormat.DefaultInterchange();
  #log = new Array<LogEntry>();
  #plants = new Map<string, Plant>();
  #tasks = new Array<Task>();

  #nextLogEntryId = 0;
  #nextTaskId = 0;

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
  get databaseFormat() {
    return this.#databaseFormat;
  }

  /**
   * The individual log entries, sorted by their timestamp, starting with the oldest.
   */
  get log(): ReadonlyArray<LogEntry> {
    return this.#log;
  }

  get nextLogEntryId(): number {
    return this.#nextLogEntryId;
  }
  get nextTaskId(): number {
    return this.#nextTaskId;
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
   * Tasks that relate to the plants in this DB.
   */
  get tasks(): ReadonlyArray<Task> {
    return this.#tasks;
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

  private constructor() {
    this.#_refresh();
  }

  getLogEntry(id: number) {
    return this.#log.find(logEntry => logEntry.id === id);
  }
  getTask(id: number) {
    return this.#tasks.find(task => task.id === id);
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
    const log = [...this.#log, LogEntry.fromLogEntry(logEntry)];

    if (!plants.has(logEntry.plantId)) {
      plants.set(logEntry.plantId, Plant.fromJSObject(this, { id: logEntry.plantId }));
    }

    return PlantDB.fromPlantDB(this, { log, plants });
  }

  /**
   * Returns a copy of this `PlantDB`, but with a given log entry replaced by a new one.
   *
   * If the referenced plant does not exist, it will be created in the new database.
   *
   * @param updatedLogEntry The new log entry to add to the database.
   * @param oldLogEntry The old log entry to remove from the database.
   * @returns The new `PlantDB`.
   */
  withUpdatedLogEntry(updatedLogEntry: LogEntry, oldLogEntry: LogEntry) {
    const plants = new Map(this.#plants);
    const log = [
      ...this.#log.filter(entry => entry.id !== oldLogEntry.id),
      LogEntry.fromLogEntry(updatedLogEntry),
    ];

    if (!plants.has(updatedLogEntry.plantId)) {
      plants.set(
        updatedLogEntry.plantId,
        Plant.fromJSObject(this, { id: updatedLogEntry.plantId })
      );
    }

    return PlantDB.fromPlantDB(this, { log, plants });
  }

  /**
   * Returns a copy of this `PlantDB`, but without the given log entry.
   *
   * @param logEntry The log entry to remove from the database.
   * @returns The new `PlantDB`.
   */
  withoutLogEntry(logEntry: LogEntry) {
    const log = [...this.#log.filter(entry => entry.id !== logEntry.id)];

    return PlantDB.fromPlantDB(this, { log });
  }

  /**
   * Returns a copy of this `PlantDB`, but with a new plant added to it.
   *
   * @param plant The plant to add to the database.
   * @returns The new `PlantDB`.
   */
  withNewPlant(plant: Plant) {
    const plants = makePlantMap([...this.#plants.values(), Plant.fromPlant(plant)]);

    return PlantDB.fromPlantDB(this, { plants });
  }

  /**
   * Returns a copy of this `PlantDB`, but with a given plant replaced by a new one.
   *
   * @param updatedPlant The new plant to add to the database.
   * @param oldPlant The old plant to remove from the database.
   * @returns The new `PlantDB`.
   */
  withUpdatedPlant(updatedPlant: Plant, oldPlant: Plant) {
    const plants = makePlantMap([
      ...[...this.#plants.values()].filter(subject => subject.id !== oldPlant.id),
      updatedPlant,
    ]);

    return PlantDB.fromPlantDB(this, { plants });
  }

  /**
   * Returns a copy of this `PlantDB`, but without the given plant.
   *
   * @param plant The plant to remove from the database.
   * @returns The new `PlantDB`.
   */
  withoutPlant(plant: Plant) {
    const plants = makePlantMap(
      [...this.#plants.values()].filter(subject => subject.id !== plant.id)
    );

    return PlantDB.fromPlantDB(this, { plants });
  }

  /**
   * Returns a copy of this `PlantDB`, but with a new task added to it.
   *
   * @param task The task to add to the database.
   * @returns The new `PlantDB`.
   */
  withNewTask(task: Task) {
    const tasks = [...this.#tasks, task];

    return PlantDB.fromPlantDB(this, { tasks });
  }

  /**
   * Returns a copy of this `PlantDB`, but with a given task replaced by a new one.
   *
   * @param updatedTask The new task to add to the database.
   * @param oldTask The old task to remove from the database.
   * @returns The new `PlantDB`.
   */
  withUpdatedTask(updatedTask: Task, oldTask: Task) {
    const tasks = [...this.#tasks.filter(subject => subject.id !== oldTask.id), updatedTask];
    return PlantDB.fromPlantDB(this, { tasks });
  }

  /**
   * Returns a copy of this `PlantDB`, but without the given task.
   *
   * @param task The task to remove from the database.
   * @returns The new `PlantDB`.
   */
  withoutTask(task: Task) {
    const tasks = [...this.#tasks].filter(subject => subject.id !== task.id);

    return PlantDB.fromPlantDB(this, { tasks });
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
      id: this.#nextLogEntryId,
      plantId,
      timestamp,
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
   * Creates a new task that is to be added to the database.
   *
   * @param title The title of the task.
   * @param date The date at which this task should be triggered.
   * @returns The created `Task`.
   */
  makeNewTask(title: string, date: Date) {
    const task = Task.fromJSObject(this, { id: this.#nextTaskId, title, date });
    return task;
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
    plantDb.#databaseFormat = initializer?.databaseFormat
      ? DatabaseFormat.fromDatabaseFormat(initializer.databaseFormat)
      : DatabaseFormat.fromDatabaseFormat(other.#databaseFormat);
    plantDb.#log = (initializer?.log ?? other.#log).map(entry =>
      LogEntry.fromLogEntry(entry, { plantDb })
    );
    plantDb.#plants = new Map(
      [...(initializer?.plants ?? other.#plants).entries()].map(([plantId, plant]) => [
        plantId,
        Plant.fromPlant(plant, { plantDb }),
      ])
    );
    plantDb.#tasks = (initializer?.tasks ?? other.#tasks).map(task =>
      Task.fromTask(task, { plantDb })
    );

    plantDb.#_refresh();

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

    plantDb.#databaseFormat = databaseFormat;

    const plantLogData = parse(plantLogDataRaw, {
      columns: false,
      delimiter: databaseFormat.columnSeparator,
      from: databaseFormat.hasHeaderRow ? 2 : 1,
    }) as Array<Array<string>>;

    // For user-supplied data, we identify the log entries by the line number in the source
    // document. This allows the user to easily find data in their source document when they
    // view the same data in a PlantDB app.
    const offset = databaseFormat.hasHeaderRow ? 2 : 1;
    for (const [index, logRecord] of plantLogData.entries()) {
      const logEntry = LogEntry.fromCSVData(plantDb, logRecord, databaseFormat, index + offset);
      plantDb.#log.push(logEntry);
    }

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

    plantDb.#_refresh();

    return plantDb;
  }

  /**
   * Seralize all data in the database to CSV.
   *
   * @param databaseFormat The format to use when serializing values.
   * @returns The data contained in the database serialized as CSV.
   */
  toCSV(databaseFormat = this.#databaseFormat) {
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
   * @param tasks The tasks to put into the database.
   * @returns A new `PlantDB` initialized with the given data.
   */
  static fromJSObjects(
    databaseFormat: DatabaseFormat,
    plants: Array<PlantSerialized> = [],
    plantLogData: Array<LogEntrySerialized> = [],
    tasks: Array<TaskSerialized> = []
  ) {
    const plantDb = new PlantDB();

    plantDb.#databaseFormat = databaseFormat;
    plantDb.#log = plantLogData.map(logEntry => LogEntry.fromJSObject(plantDb, logEntry));

    for (const plant of plants) {
      plantDb.#plants.set(plant.id, Plant.fromJSObject(plantDb, plant));
    }

    plantDb.#tasks = tasks.map(task => Task.fromJSObject(plantDb, task));

    plantDb.#_refresh();

    return plantDb;
  }

  #_refresh() {
    this.#log.sort((a, b) => a.timestamp.valueOf() - b.timestamp.valueOf());

    this.#nextLogEntryId =
      this.#log.reduce(
        (nextId, logEntry) => Math.max(nextId, logEntry.id),
        this.#databaseFormat.hasHeaderRow ? 1 : 0
      ) + 1;

    this.#nextTaskId = this.#tasks.reduce((nextId, task) => Math.max(nextId, task.id), 0) + 1;

    this.#entryTypes = aggregateEventTypes(this.#log);
    this.#kinds = aggregateKinds([...this.#plants.values()]);
    this.#locations = aggregateLocations([...this.#plants.values()]);
    this.#potColors = aggregatePotColors([...this.#plants.values()]);
    this.#potShapes = aggregatePotShapes([...this.#plants.values()]);
    this.#substrates = aggregateSubstrates([...this.#plants.values()]);
    this.#usedProducts = aggregateProductsUsed(this.#log);
  }
}
