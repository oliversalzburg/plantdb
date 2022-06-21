import { LogEntry, Plant, PlantDB, Task } from "@plantdb/libplantdb";
import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import lunr, { Index } from "lunr";
import { DateTime } from "luxon";
import { GoogleDrive } from "../storage/GoogleDrive";
import { IndexedDb } from "../storage/IndexedDb";
import { LocalStorage } from "../storage/LocalStorage";
import { StorageDriver } from "../storage/StorageDriver";
import { executeAsyncContext } from "../tools/Async";
import { isNil, mustExist } from "../tools/Maybe";
import { rruleFromTask } from "../tools/TaskTools";

let globalStore: PlantStore | undefined;

export const retrieveStore = () => globalStore;

@customElement("pn-plant-store")
export class PlantStore extends LitElement {
  @property({ type: PlantDB })
  plantDb = PlantDB.Empty();

  private _indexLog: Index | undefined;
  private _indexPlants: Index | undefined;

  indexedDb = new IndexedDb();
  localStorage: StorageDriver = new LocalStorage();
  googleDrive = new GoogleDrive();

  connectedCallback(): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    globalStore = this;

    executeAsyncContext(async () => {
      await this.indexedDb.prepare();
      await this.localStorage.prepare();
      // Google Drive is not prepared until absolutely necessary!

      const storedDb = await this.localStorage.retrievePlantDb();
      if (storedDb) {
        console.info("Restored DB from localStorage.");
        this.plantDb = storedDb;
        this._updateIndex();

        this.dispatchEvent(new CustomEvent("pn-config-changed", { detail: this.plantDb }));
      }
    });
  }

  disconnectedCallback(): void {
    globalStore = undefined;
  }

  async updatePlantDb(plantDb: PlantDB) {
    this.plantDb = plantDb;
    await this.localStorage.persistPlantDb(this.plantDb);
    console.info("Stored DB in localStorage.");

    if (!this.indexedDb.connected) {
      await this.indexedDb.connect();
    }
    await this.indexedDb.persistPlantDb(plantDb);
    console.info("Stored DB in IndexedDB.");

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

    await this.updatePlantDb(plantDb);
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

      this.ref("id");
      this.field("plantId");
      this.field("type");
      this.field("note");
      this.field("productUsed");

      this.field("plantName");
      this.field("plantKind");
      this.field("plantLocation");

      log.forEach(logEntry => {
        this.add({
          id: logEntry.id,
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

  tasksForDateRange(start: Date, end: Date) {
    const schedule = new Array<Task>();
    for (const task of this.plantDb.tasks) {
      if (!task.repeats) {
        // TODO: Validate `task.dateTime` against `start`-`end`.
        schedule.push(task);
        continue;
      }

      const rrule = rruleFromTask(task);
      const occurences = rrule.between(start, end);
      console.log(occurences);
      for (const occurence of occurences) {
        const copy = Task.fromTask(task, {
          date: DateTime.fromObject({
            year: occurence.getUTCFullYear(),
            month: occurence.getUTCMonth() + 1,
            day: occurence.getUTCDate(),
          }).toJSDate(),
        });
        schedule.push(copy);
      }
    }

    return schedule;
  }
}
