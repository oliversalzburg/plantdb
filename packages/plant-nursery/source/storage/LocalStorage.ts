import { DatabaseFormat, LogEntrySerialized, PlantDB, PlantSerialized } from "@plantdb/libplantdb";
import { isNil } from "../Maybe";

export class LocalStorage {
  static getRawData() {
    const storedConfig = localStorage.getItem("plantdb.config");

    const storedLog = localStorage.getItem("plantdb.log");
    const storedPlants = localStorage.getItem("plantdb.plants");

    return {
      config: storedConfig,
      log: storedLog,
      plants: storedPlants,
    };
  }

  static retrievePlantDb() {
    const { config, log, plants } = LocalStorage.getRawData();

    if (isNil(config) || isNil(log) || isNil(plants)) {
      return null;
    }

    const databaseFormat = DatabaseFormat.fromJSON(config);
    const logData = JSON.parse(log) as Array<LogEntrySerialized>;
    const plantData = JSON.parse(plants) as Array<PlantSerialized>;
    return PlantDB.fromJSObjects(databaseFormat, plantData, logData);
  }

  static persistPlantDb(plantDb: PlantDB) {
    const config = JSON.stringify(plantDb.config);
    const log = JSON.stringify(plantDb.log);
    const plants = JSON.stringify([...plantDb.plants.values()]);

    localStorage.setItem("plantdb.config", config);
    localStorage.setItem("plantdb.log", log);
    localStorage.setItem("plantdb.plants", plants);
  }
}
