import { LogEntry, Plant, PlantDB, Task } from "@plantdb/libplantdb";
import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import lunr, { Index } from "lunr";
import { DateTime } from "luxon";
import { GoogleDrive } from "../storage/GoogleDrive";
import { IndexedDb } from "../storage/IndexedDb";
import { LocalStorage } from "../storage/LocalStorage";
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
  private _indexTasks: Index | undefined;

  indexedDb = new IndexedDb();
  localStorage = new LocalStorage();
  googleDrive = new GoogleDrive();

  connectedCallback(): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    globalStore = this;

    executeAsyncContext(async () => {
      await this.indexedDb.prepare();
      await this.localStorage.prepare();
      // Google Drive is not prepared until absolutely necessary!

      await this.indexedDb.connect();
      await this.localStorage.connect();
    });
  }

  disconnectedCallback(): void {
    globalStore = undefined;
  }

  async loadFromCache() {
    this.indexedDb.validate();

    const storedDb = await this.indexedDb.retrievePlantDb();
    if (storedDb) {
      console.info("Using DB provided through IndexedDB.");
      this.plantDb = storedDb;
      this._updateIndex();

      this.dispatchEvent(new CustomEvent("pn-config-changed", { detail: this.plantDb }));
    } else {
      console.info("Unable to use IndexedDB data.");
    }
  }

  async resetCache() {
    await this.indexedDb.recreateStores();
  }

  async updatePlantDb(plantDb: PlantDB) {
    this.plantDb = plantDb;

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
    this._indexPlants = this.indexFromPlants([...this.plantDb.plants.values()]);
    this._indexTasks = this.indexFromTasks(this.plantDb.tasks);
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

  indexFromTasks(tasks: ReadonlyArray<Task>) {
    return lunr(function () {
      this.pipeline.remove(lunr.stemmer);

      this.ref("id");
      this.field("title");

      tasks.forEach(task => {
        this.add(task);
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
    if (isNil(index)) {
      return [];
    }

    if (term === "") {
      return this.plantDb.log;
    }

    const formal = this.formalizeLunrSearch(term);
    console.debug(`Performing formal search for: ${formal}`);

    const results = index.search(formal);
    const logEntries = results.map(result =>
      mustExist(this.plantDb.getLogEntry(Number(result.ref)))
    );
    return logEntries;
  }

  searchPlants(term: string, index = this._indexPlants) {
    if (isNil(index)) {
      return [];
    }

    if (term === "") {
      return [...this.plantDb.plants.values()];
    }

    const formal = this.formalizeLunrSearch(term);
    console.debug(`Performing formal search for: ${formal}`);

    const results = index.search(formal);
    const plants = results
      .map(result => this.plantDb.plants.get(result.ref))
      .filter(Boolean) as Array<Plant>;
    return plants;
  }

  searchTasks(term: string, index = this._indexTasks) {
    if (isNil(index)) {
      return [];
    }

    if (term === "") {
      return this.plantDb.tasks;
    }

    const formal = this.formalizeLunrSearch(term);
    console.debug(`Performing formal search for: ${formal}`);

    const results = index.search(formal);
    const tasks = results.map(result => mustExist(this.plantDb.getTask(Number(result.ref))));
    return tasks;
  }

  tasksForDateRange(start: Date, end: Date) {
    const schedule = new Array<Task>();
    for (const task of this.plantDb.tasks) {
      if (!task.repeats) {
        if (
          start.valueOf() <= task.dateTime.valueOf() &&
          task.dateTime.valueOf() <= end.valueOf()
        ) {
          schedule.push(task);
        }
        continue;
      }

      const rrule = rruleFromTask(task);
      const occurences = rrule.between(start, end);
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

    schedule.sort((a, b) => a.dateTime.valueOf() - b.dateTime.valueOf());

    return schedule;
  }
}
