import {
  DatabaseFormat,
  LogEntrySerialized,
  PlantDB,
  PlantSerialized,
  TaskSerialized,
} from "@plantdb/libplantdb";
import { isNil } from "../tools/Maybe";
import { StorageDriver } from "./StorageDriver";

export class LocalStorage implements StorageDriver {
  prepare() {
    return Promise.resolve(true);
  }
  connect() {
    return Promise.resolve(true);
  }

  get connected() {
    return true;
  }

  private static _getRawData() {
    const storedConfig = localStorage.getItem("plantdb.config");

    const storedLog = localStorage.getItem("plantdb.log");
    const storedPlants = localStorage.getItem("plantdb.plants");
    const storedTasks = localStorage.getItem("plantdb.tasks");

    return {
      config: storedConfig,
      log: storedLog,
      plants: storedPlants,
      tasks: storedTasks,
    };
  }

  getConfiguration(): Promise<DatabaseFormat> {
    const storedConfig = localStorage.getItem("plantdb.config");
    if (isNil(storedConfig)) {
      return Promise.resolve(DatabaseFormat.DefaultInterchange());
    }
    return Promise.resolve(DatabaseFormat.fromJSON(storedConfig));
  }

  retrievePlantDb() {
    const { config, log, plants, tasks } = LocalStorage._getRawData();

    if (isNil(config) || isNil(log) || isNil(plants)) {
      throw new Error("Incomplete data.");
    }

    const databaseFormat = DatabaseFormat.fromJSON(config);
    const logData = JSON.parse(log) as Array<LogEntrySerialized>;
    const plantData = JSON.parse(plants) as Array<PlantSerialized>;
    const taskData = JSON.parse(tasks ?? "") as Array<TaskSerialized>;
    return Promise.resolve(PlantDB.fromJSObjects(databaseFormat, plantData, logData, taskData));
  }

  persistPlantDb(plantDb: PlantDB) {
    const config = JSON.stringify(plantDb.databaseFormat.toJSObject());
    const log = JSON.stringify(plantDb.log.map(logEntry => logEntry.toJSObject()));
    const plants = JSON.stringify([...plantDb.plants.values()].map(plant => plant.toJSObject()));
    const tasks = JSON.stringify(plantDb.tasks.map(task => task.toJSObject()));

    localStorage.setItem("plantdb.config", config);
    localStorage.setItem("plantdb.log", log);
    localStorage.setItem("plantdb.plants", plants);
    localStorage.setItem("plantdb.tasks", tasks);

    return Promise.resolve(true);
  }
}
