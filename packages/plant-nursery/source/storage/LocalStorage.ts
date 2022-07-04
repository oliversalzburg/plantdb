import {
  DatabaseFormat,
  DictionaryClassifier,
  DictionaryClassifiers,
  EventType,
  LogEntrySerialized,
  PlantDB,
  PlantSerialized,
  TaskSerialized,
  UserDictionary,
  UserDictionarySerialized,
} from "@plantdb/libplantdb";
import { isNil } from "../tools/Maybe";
import { getConfigurationFromPlantDB, NurseryConfiguration, StorageDriver } from "./StorageDriver";

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

  /** @inheritDoc */
  async getApplicationConfiguration() {
    const storedConfig = localStorage.getItem("plantdb.config");
    if (isNil(storedConfig)) {
      return Promise.resolve({
        databaseFormat: DatabaseFormat.DefaultInterchange(),
        typeMap: new UserDictionary<EventType>(DictionaryClassifiers.LogEntryEventType, {}),
      });
    }

    return Promise.resolve({
      databaseFormat: DatabaseFormat.fromJSON(storedConfig),
      typeMap: (await this.getUserDictionaries()).get(
        DictionaryClassifiers.LogEntryEventType
      ) as UserDictionary<EventType>,
    });
  }

  /** @inheritDoc */
  getUserDictionaries() {
    const storedDictionaries = localStorage.getItem("plantdb.dicts");
    if (isNil(storedDictionaries)) {
      return Promise.resolve(PlantDB.DefaultDictionaries());
    }
    const dictionaries = JSON.parse(storedDictionaries) as Array<UserDictionarySerialized>;
    const userDictionaries = dictionaries.reduce((map, { classifier, dictionary }) => {
      map.set(
        classifier as DictionaryClassifier,
        new UserDictionary(classifier as DictionaryClassifier, dictionary)
      );
      return map;
    }, new Map<DictionaryClassifier, UserDictionary>());
    return Promise.resolve(userDictionaries);
  }

  /** @inheritDoc */
  updateApplicationConfiguration(configuration: NurseryConfiguration): Promise<void> {
    localStorage.setItem("plantdb.config", JSON.stringify(configuration.databaseFormat));
    localStorage.setItem("plantdb.dicts", JSON.stringify([configuration.typeMap.toJSObject()]));
    return Promise.resolve();
  }

  /** @inheritDoc */
  getRawLog() {
    const dataString = localStorage.getItem("plantdb.log");
    if (isNil(dataString)) {
      return Promise.resolve(null);
    }
    const rawData = JSON.parse(dataString) as Array<LogEntrySerialized>;
    return Promise.resolve(rawData);
  }
  /** @inheritDoc */
  getRawPlants() {
    const dataString = localStorage.getItem("plantdb.plants");
    if (isNil(dataString)) {
      return Promise.resolve(null);
    }
    const rawData = JSON.parse(dataString) as Array<PlantSerialized>;
    return Promise.resolve(rawData);
  }
  /** @inheritDoc */
  getRawTasks() {
    const dataString = localStorage.getItem("plantdb.tasks");
    if (isNil(dataString)) {
      return Promise.resolve(null);
    }
    const rawData = JSON.parse(dataString) as Array<TaskSerialized>;
    return Promise.resolve(rawData);
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
    const log = JSON.stringify(plantDb.log.map(logEntry => logEntry.toJSObject()));
    const plants = JSON.stringify([...plantDb.plants.values()].map(plant => plant.toJSObject()));
    const tasks = JSON.stringify(plantDb.tasks.map(task => task.toJSObject()));

    await this.updateApplicationConfiguration(getConfigurationFromPlantDB(plantDb));

    localStorage.setItem("plantdb.log", log);
    localStorage.setItem("plantdb.plants", plants);
    localStorage.setItem("plantdb.tasks", tasks);

    return true;
  }
}
