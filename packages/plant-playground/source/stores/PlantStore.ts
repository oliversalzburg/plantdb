import {
  DatabaseFormat,
  LogEntry,
  LogEntrySerialized,
  Plant,
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

  indexFromPlants(plants: ReadonlyArray<Plant>) {
    return lunr(function () {
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

  /**
   * Take a search term, as given by the user, and transform it so that it:
   *  - performs substring matching
   *  - requires all provided terms to match
   * @param term The search term as input by the user.
   * @returns A formalized lunr search term.
   */
  formalizeLunrSearch(term: string) {
    return term
      .split(" ")
      .filter(fragment => fragment.length)
      .map(fragment => `+*${fragment}*`)
      .join(" ");
  }

  searchLog(term: string, index = this._indexLog) {
    const results = mustExist(index).search(this.formalizeLunrSearch(term));
    console.debug(results);
    const logEntries = results.map(result => this.plantDb.log[Number(result.ref)]);
    console.debug(logEntries);
    return logEntries;
  }
  searchPlants(term: string, index = this._indexPlants) {
    const results = mustExist(index).search(this.formalizeLunrSearch(term));
    console.debug(results);
    const logEntries = results
      .map(result => this.plantDb.plants.get(result.ref))
      .filter(Boolean) as Array<Plant>;
    console.debug(logEntries);
    return logEntries;
  }
}
