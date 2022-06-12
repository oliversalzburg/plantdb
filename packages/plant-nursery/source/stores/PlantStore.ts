import { LogEntry, Plant, PlantDB } from "@plantdb/libplantdb";
import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import lunr, { Index } from "lunr";
import { GoogleDrive } from "../storage/GoogleDrive";
import { LocalStorage } from "../storage/LocalStorage";
import { isNil, mustExist } from "../tools/Maybe";

let globalStore: PlantStore | undefined;

export const retrieveStore = () => globalStore;

@customElement("pn-plant-store")
export class PlantStore extends LitElement {
  @property({ type: PlantDB })
  plantDb = PlantDB.Empty();

  private _indexLog: Index | undefined;
  private _indexPlants: Index | undefined;

  googleDrive = new GoogleDrive();

  connectedCallback(): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    globalStore = this;

    const storedDb = LocalStorage.retrievePlantDb();
    if (storedDb) {
      console.info("Restored DB from localStorage.");
      this.plantDb = storedDb;
      this._updateIndex();

      this.dispatchEvent(new CustomEvent("pn-config-changed", { detail: this.plantDb }));
    }
  }

  disconnectedCallback(): void {
    globalStore = undefined;
  }

  updatePlantDb(plantDb: PlantDB) {
    this.plantDb = plantDb;
    LocalStorage.persistPlantDb(this.plantDb);
    console.info("Stored DB in localStorage.");
    this.dispatchEvent(new CustomEvent("pn-config-changed", { detail: this.plantDb }));
  }

  async googleDriveConnect() {
    return this.googleDrive.connect();
  }
  async googleDrivePull() {
    const plantDb = await this.googleDrive.retrievePlantDb();
    if (!plantDb) {
      return;
    }

    this.updatePlantDb(plantDb);
  }
  async googleDrivePush() {
    return this.googleDrive.persistPlantDb(this.plantDb);
  }

  private _updateIndex() {
    this._indexLog = this.indexFromLog(this.plantDb.log);

    const plants = [...this.plantDb.plants.values()];
    this._indexPlants = lunr(function () {
      this.pipeline.remove(lunr.stemmer);

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
      this.pipeline.remove(lunr.stemmer);

      this.ref("sourceLine");
      this.field("plantId");
      this.field("type");
      this.field("note");
      this.field("productUsed");

      this.field("plantName");
      this.field("plantKind");
      this.field("plantLocation");

      log.forEach(logEntry => {
        this.add({
          sourceLine: logEntry.sourceLine,
          plantId: logEntry.plantId,
          type: logEntry.type,
          note: logEntry.notes,
          productUsed: logEntry.productUsed,

          plantName: logEntry.plant.name,
          plantKind: logEntry.plant.kind,
          plantLocation: logEntry.plant.location,
        });
      });
    });
  }

  indexFromPlants(plants: ReadonlyArray<Plant>) {
    return lunr(function () {
      this.pipeline.remove(lunr.stemmer);

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
   *
   * @param term The search term as input by the user.
   * @returns A formalized lunr search term.
   */
  formalizeLunrSearch(term: string) {
    return term
      .split(" ")
      .filter(fragment => fragment.length)
      .map(fragment => `+${fragment}*`)
      .join(" ");
  }

  searchLog(term: string, index = this._indexLog) {
    const formal = this.formalizeLunrSearch(term);
    console.debug(`Performing formal search for: ${formal}`);

    const results = mustExist(index).search(formal);
    const logEntries = results.map(result => this.plantDb.log[Number(result.ref)]);
    return logEntries;
  }

  searchPlants(term: string, index = this._indexPlants) {
    if (isNil(index)) {
      return [];
    }

    const formal = this.formalizeLunrSearch(term);
    console.debug(`Performing formal search for: ${formal}`);

    const results = index.search(formal);
    const logEntries = results
      .map(result => this.plantDb.plants.get(result.ref))
      .filter(Boolean) as Array<Plant>;
    return logEntries;
  }
}
