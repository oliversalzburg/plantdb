import { PlantDB } from "@plantdb/libplantdb";

export class PlantDbStorage {
  static persistPlantDb(plantDb: PlantDB) {
    const config = JSON.stringify(plantDb.config);
    const log = JSON.stringify(plantDb.log);
    const plants = JSON.stringify([...plantDb.plants.values()]);

    localStorage.setItem("plantdb.config", config);
    localStorage.setItem("plantdb.log", log);
    localStorage.setItem("plantdb.plants", plants);

    console.info("Updated stored database.");
  }
}
