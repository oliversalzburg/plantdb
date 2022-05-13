import { DatabaseFormat, LogEntrySerialized, PlantDB, PlantSerialized } from "@plantdb/libplantdb";
import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { PlantDbStorage } from "../PlantDbStorage";

let globalStore: PlantStore | undefined;

export const retrieveStore = () => globalStore;

@customElement("plant-store")
export class PlantStore extends LitElement {
  @property({ type: PlantDB })
  plantDb = PlantDB.Empty();

  connectedCallback(): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    globalStore = this;

    const storedConfig = localStorage.getItem("plantdb.config");
    if (storedConfig) {
      const storedLog = localStorage.getItem("plantdb.log");
      const storedPlants = localStorage.getItem("plantdb.plants");

      if (storedLog && storedPlants) {
        const config = DatabaseFormat.fromJSON(storedConfig);
        const logData = JSON.parse(storedLog) as Array<LogEntrySerialized>;
        //const log = logData.map(logEntry => LogEntry.fromJSON(logEntry));

        const plants = JSON.parse(storedPlants) as Array<PlantSerialized>;
        //this.plants = plants.map(plant => Plant.fromJSON(plant, log));
        this.plantDb = PlantDB.fromJSObjects(config, plants, logData);
      }

      this.dispatchEvent(new CustomEvent("plant-config-changed", { detail: this.plantDb }));
    }
  }

  disconnectedCallback(): void {
    globalStore = undefined;
  }

  updatePlantDb(plantDb: PlantDB) {
    this.plantDb = plantDb;
    PlantDbStorage.persistPlantDb(this.plantDb);
  }
}
