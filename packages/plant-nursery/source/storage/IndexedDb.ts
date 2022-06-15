import { DatabaseFormat, PlantDB } from "@plantdb/libplantdb";
import { IDBPDatabase, openDB } from "idb";
import { isNil, mustExist } from "../tools/Maybe";
import { StorageDriver } from "./StorageDriver";

export class IndexedDb implements StorageDriver {
  /**
   * We always use the default database format to interact with IndexedDB.
   */
  private _databaseFormat = new DatabaseFormat();

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
      },
    });
    return Promise.resolve(true);
  }

  get connected() {
    return !isNil(this._dbPlantDb);
  }

  async retrievePlantDb() {
    const log = await mustExist(this._dbPlantDb).getAll("plantlog");
    const plants = await mustExist(this._dbPlantDb).getAll("plants");
    return PlantDB.fromJSObjects(this._databaseFormat, plants, log);
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
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
