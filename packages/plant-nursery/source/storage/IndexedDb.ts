import {
  DatabaseFormat,
  DictionaryClassifiers,
  EventType,
  LogEntrySerialized,
  PlantDB,
  PlantSerialized,
  TaskSerialized,
  UserDictionary,
} from "@plantdb/libplantdb";
import { deleteDB, IDBPDatabase, openDB } from "idb";
import { coalesceOnError } from "../tools/Async";
import { assertExists, isNil, mustExist } from "../tools/Maybe";
import { LocalStorage } from "./LocalStorage";
import { getConfigurationFromPlantDB, NurseryConfiguration, StorageDriver } from "./StorageDriver";

export class IndexedDb implements StorageDriver {
  /**
   * We always use the default database format to interact with IndexedDB.
   */
  private _databaseFormat = DatabaseFormat.DefaultInterchange();

  private _dbPlantDb: IDBPDatabase<unknown> | undefined;

  /**
   * We only persist tabular data into IndexedDB. Hierarchical data, like
   * configuration, is still persisted to LocalStorage.
   */
  private _localStorage = new LocalStorage();

  /** @inheritDoc */
  async prepare() {
    await this._localStorage.prepare();
    return true;
  }

  static SCHEMA_INDEX = 1;

  /**
   * Creates the connection to the IndexedDB instance.
   *
   * @returns `true` if the connection succeeded
   */
  async connect() {
    await this._localStorage.connect();

    this._dbPlantDb = await openDB("plantdb", IndexedDb.SCHEMA_INDEX, {
      upgrade(db) {
        const storeLog = db.createObjectStore("plantlog", { keyPath: "id" });
        storeLog.createIndex("timestamp", "timestamp");

        const storePlants = db.createObjectStore("plants", { keyPath: "id" });
        storePlants.createIndex("isArchived", "isArchived");

        const storeTasks = db.createObjectStore("tasks", { keyPath: "id" });
        storeTasks.createIndex("date", "date");
      },
    });

    return Promise.resolve(true);
  }

  async recreateStores() {
    await deleteDB("plantdb");
    return this.connect();
  }

  /** @inheritDoc */
  get connected() {
    return !isNil(this._dbPlantDb);
  }

  /** @inheritDoc */
  async getApplicationConfiguration() {
    return {
      databaseFormat: this._databaseFormat,
      typeMap: (await this._localStorage.getUserDictionaries()).get(
        DictionaryClassifiers.LogEntryEventType
      ) as UserDictionary<EventType>,
    };
  }

  /** @inheritDoc */
  getUserDictionaries() {
    return this._localStorage.getUserDictionaries();
  }

  /** @inheritDoc */
  updateApplicationConfiguration(configuration: NurseryConfiguration) {
    return this._localStorage.updateApplicationConfiguration({
      // Ignore passed database format. The format for IndexedDB storage is not mutable.
      databaseFormat: this._databaseFormat,
      typeMap: configuration.typeMap,
    });
  }

  /** @inheritDoc */
  async getRawLog() {
    const dataObject = await coalesceOnError(
      () => mustExist(this._dbPlantDb).getAll("plantlog"),
      null
    );
    if (isNil(dataObject)) {
      return Promise.resolve(null);
    }
    const rawData = dataObject as Array<LogEntrySerialized>;
    return Promise.resolve(rawData);
  }
  /** @inheritDoc */
  async getRawPlants() {
    const dataObject = await coalesceOnError(
      () => mustExist(this._dbPlantDb).getAll("plants"),
      null
    );
    if (isNil(dataObject)) {
      return Promise.resolve(null);
    }
    const rawData = dataObject as Array<PlantSerialized>;
    return Promise.resolve(rawData);
  }
  /** @inheritDoc */
  async getRawTasks() {
    const dataObject = await coalesceOnError(
      () => mustExist(this._dbPlantDb).getAll("tasks"),
      null
    );
    if (isNil(dataObject)) {
      return Promise.resolve(null);
    }
    const rawData = dataObject as Array<TaskSerialized>;
    return Promise.resolve(rawData);
  }

  validate() {
    assertExists(this._dbPlantDb);

    const storeExistence = [
      this._dbPlantDb.objectStoreNames.contains("plantlog"),
      this._dbPlantDb.objectStoreNames.contains("plants"),
      this._dbPlantDb.objectStoreNames.contains("tasks"),
    ];

    if (storeExistence.includes(true) && storeExistence.includes(false)) {
      // Because we currently don't increase the schema index, this is expected
      // to happen all the time.
      throw new Error("Stored database does not match expectations.");
    }
  }

  async retrievePlantDb() {
    const config = await this.getApplicationConfiguration();
    const log = await this.getRawLog();
    const plants = await this.getRawPlants();
    const tasks = await this.getRawTasks();

    if (isNil(config) || isNil(log) || isNil(plants) || isNil(tasks)) {
      throw new Error("Incomplete data.");
    }

    return Promise.resolve(
      PlantDB.fromJSObjects(
        config.databaseFormat,
        [config.typeMap.toJSObject()],
        plants,
        log,
        tasks
      )
    );
  }

  async persistPlantDb(plantDb: PlantDB) {
    const db = mustExist(this._dbPlantDb);
    try {
      await this.updateApplicationConfiguration(getConfigurationFromPlantDB(plantDb));

      for (const logEntry of plantDb.log) {
        await db.put("plantlog", logEntry.toJSObject());
      }
      for (const plant of plantDb.plants.values()) {
        await db.put("plants", plant.toJSObject());
      }
      for (const task of plantDb.tasks) {
        await db.put("tasks", task.toJSObject());
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
