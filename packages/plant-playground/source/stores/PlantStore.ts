import {
  DatabaseFormat,
  LogEntry,
  LogEntrySerialized,
  PlantDB,
  PlantSerialized,
} from "@plantdb/libplantdb";
import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import lunr, { Index } from "lunr";
import { mustExist } from "../Maybe";
import { PlantDbStorage } from "../PlantDbStorage";

let globalStore: PlantStore | undefined;

export const retrieveStore = () => globalStore;

@customElement("plant-store")
export class PlantStore extends LitElement {
  @property({ type: PlantDB })
  plantDb = PlantDB.Empty();

  private _indexLog: Index | undefined;
  private _indexPlants: Index | undefined;

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

        this._updateIndex();

        this.dispatchEvent(new CustomEvent("plant-config-changed", { detail: this.plantDb }));
      }
    }
  }

  disconnectedCallback(): void {
    globalStore = undefined;
  }

  updatePlantDb(plantDb: PlantDB) {
    this.plantDb = plantDb;
    PlantDbStorage.persistPlantDb(this.plantDb);
  }

  private _updateIndex() {
    this._indexLog = this.indexFromLog(this.plantDb.log);

    const plants = [...this.plantDb.plants.values()];
    this._indexPlants = lunr(function () {
      this.ref("id");
      this.field("id");
      this.field("name");
      this.field("kind");
      this.field("substrate");
      this.field("location");
      this.field("notes");

      plants.forEach(plant => {
        this.add(plant);
      });
    });
  }

  indexFromLog(log: ReadonlyArray<LogEntry>) {
    return lunr(function () {
      this.ref("sourceLine");
      this.field("plantId");
      this.field("type");
      this.field("note");
      this.field("productUsed");

      log.forEach(logEntry => {
        this.add(logEntry);
      });
    });
  }
  searchLog(term: string, index = this._indexLog) {
    const results = mustExist(index).search(term);
    console.debug(results);
    const logEntries = results.map(result => this.plantDb.log[Number(result.ref)]);
    console.debug(logEntries);
    return logEntries;
  }
}
