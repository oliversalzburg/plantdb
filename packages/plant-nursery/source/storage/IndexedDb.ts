import { DatabaseFormat, PlantDB } from "@plantdb/libplantdb";
import { IDBPDatabase, openDB } from "idb";
import { coalesceOnError } from "../tools/Async";
import { isNil, mustExist } from "../tools/Maybe";
import { StorageDriver } from "./StorageDriver";

export class IndexedDb implements StorageDriver {
  /**
   * We always use the default database format to interact with IndexedDB.
   */
  private _databaseFormat = DatabaseFormat.DefaultInterchange();

  private _dbPlantDb: IDBPDatabase<unknown> | undefined;

  prepare() {
    return Promise.resolve(true);
  }

  async connect() {
    this._dbPlantDb = await openDB("plantdb", 1, {
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

  get connected() {
    return !isNil(this._dbPlantDb);
  }

  getConfiguration(): Promise<DatabaseFormat> {
    return Promise.resolve(this._databaseFormat);
  }

  async retrievePlantDb() {
    const log = await coalesceOnError(() => mustExist(this._dbPlantDb).getAll("plantlog"), null);
    const plants = await coalesceOnError(() => mustExist(this._dbPlantDb).getAll("plants"), null);
    const tasks = await coalesceOnError(() => mustExist(this._dbPlantDb).getAll("tasks"), null);

    if (isNil(log) || isNil(plants) || isNil(tasks)) {
      return null;
    }

    return PlantDB.fromJSObjects(this._databaseFormat, plants, log, tasks);
  }

  async persistPlantDb(plantDb: PlantDB) {
    const db = mustExist(this._dbPlantDb);
    try {
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
