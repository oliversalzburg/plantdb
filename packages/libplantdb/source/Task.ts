import { DateTime } from "luxon";
import { intFromCSV, valueFromCSV } from "./csv/Tools";
import { DatabaseFormat } from "./DatabaseFormat";
import { PlantDB } from "./PlantDB";

/**
 * Describes an object containing all the fields required to initialize a `Task`.
 */
export type TaskSerialized = {
  /**
   * @inheritDoc Task.id
   */
  id: number;

  /**
   * @inheritDoc Task.title
   */
  title: string;

  /**
   * @inheritDoc Task.date
   */
  date: Date;

  /**
   * @inheritDoc Task.time
   */
  time?: Date;

  /**
   * @inheritDoc Task.notes
   */
  notes?: string;

  /**
   * @inheritDoc Task.plantId
   */
  plantId?: string | Array<string>;

  /**
   * @inheritDoc Task.repeatInterval
   */
  repeatInterval?: number;

  /**
   * @inheritDoc Task.repeatUnit
   */
  repeatUnit?: string;

  /**
   * @inheritDoc Task.repeatDays
   */
  repeatDays?: Array<string>;

  /**
   * @inheritDoc Task.endsOn
   */
  endsOn?: Date;

  /**
   * @inheritDoc Task.endsAfter
   */
  endsAfter?: number;
};

/**
 * A task relating to plants in the PlantDB.
 */
export class Task {
  #plantDb: PlantDB;
  #id: number;
  #title: string;
  #dateTime: Date;
  #notes: string | undefined;
  #plantId: string | Array<string> | undefined;
  #repeatInterval: number | undefined;
  #repeatUnit: string | undefined;
  #repeatDays: Array<string> | undefined;
  #endsOn: Date | undefined;
  #endsAfter: number | undefined;

  /**
   * The `PlantDB` this task is associated with.
   */
  get plantDb() {
    return this.#plantDb;
  }

  /**
   * The ID of this task.
   */
  get id() {
    return this.#id;
  }

  /**
   * The title of this task.
   */
  get title() {
    return this.#title;
  }

  /**
   * The day at which this task should be triggered.
   */
  get date() {
    return DateTime.fromJSDate(this.#dateTime).startOf("day").toJSDate();
  }

  /**
   * The date, including the time of day, at which this task should be triggered.
   */
  get dateTime() {
    return this.#dateTime;
  }

  /**
   * Notes stored with the task.
   */
  get notes() {
    return this.#notes;
  }

  /**
   * The ID of plants associated with this task.
   */
  get plantId() {
    return this.#plantId;
  }

  /**
   * At which interval to repeat the task.
   */
  get repeatInterval() {
    return this.#repeatInterval;
  }

  /**
   * The time span after which the task should repeat.
   */
  get repeatUnit() {
    return this.#repeatUnit;
  }

  /**
   * The days of the week at which to repeat this task.
   */
  get repeatDays() {
    return this.#repeatDays;
  }

  /**
   * The date at which the task should no longer be repeated.
   */
  get endsOn() {
    return this.#endsOn;
  }

  /**
   * After how many repetitions should the task no longer be repeated?
   */
  get endsAfter() {
    return this.#endsAfter;
  }

  /**
   * Constructs a new `Task`.
   *
   * @param plantDb The `PlantDB` this `Task` belongs to.
   * @param id The ID of this task.
   * @param title The title of this task.
   * @param date The date at which this task should be triggered.
   * @param time The time of day at the given date when this task should be triggered.
   * The _date_ part of this value is ignored. The time of day will be applied to the
   * provided `date` value.
   */
  private constructor(plantDb: PlantDB, id: number, title: string, date: Date, time?: Date) {
    this.#plantDb = plantDb;
    this.#id = id;
    this.#title = title;

    const dateSource = DateTime.fromJSDate(date);
    if (time) {
      const timeSource = DateTime.fromJSDate(time);
      dateSource.set({
        hour: timeSource.get("hour"),
        minute: timeSource.get("minute"),
        second: timeSource.get("second"),
        millisecond: timeSource.get("millisecond"),
      });
    } else {
      dateSource.startOf("day");
    }
    this.#dateTime = dateSource.toJSDate();
  }

  /**
   * Constructs a new `Task`, given another task as a template and a has with additional properties.
   *
   * @param other The `Task` to copy properties from.
   * @param initializer A hash containing properties to add to or override in the template.
   * @returns A new `Task` with the `other` task and the initializer merged into it.
   */
  static fromTask(other: Task, initializer?: Partial<Task>) {
    const task = new Task(
      initializer?.plantDb ?? other.#plantDb,
      initializer?.id ?? other.#id,
      initializer?.title ?? other.#title,
      initializer?.dateTime ?? other.#dateTime,
      initializer?.dateTime ?? other.#dateTime
    );
    return task;
  }

  /**
   * Constructs a `Task` from CSV data.
   *
   * @param plantDb The `PlantDB` to create the task in.
   * @param dataRow The strings that were read from the CSV input.
   * @param databaseFormat The `DatabaseFormat` to use when interpreting values.
   * @returns The constructed `Task`.
   */
  static fromCSVData(
    plantDb: PlantDB,
    dataRow: Array<string>,
    databaseFormat: DatabaseFormat
  ): Task {
    let rowPointer = 0;

    const id = intFromCSV(dataRow, rowPointer++, databaseFormat);
    if (!id) {
      throw new Error("Invalid ID");
    }

    const title = valueFromCSV(dataRow, rowPointer++, false) as string | undefined;
    if (!title) {
      throw new Error("Invalid title");
    }

    const date = valueFromCSV(dataRow, rowPointer++, false) as string | undefined;
    if (!date) {
      throw new Error("Invalid date");
    }

    const logEntry = new Task(
      plantDb,
      id,
      title,
      DateTime.fromFormat(date, databaseFormat.dateFormat, {
        zone: databaseFormat.timezone,
      }).toJSDate()
    );

    return logEntry;
  }

  /**
   * Seralize the `Task` so it can be turned into CSV.
   *
   * @param databaseFormat The `DatabaseFormat` to use when serializing values.
   * @returns The `Task` ready to be serialized into CSV.
   */
  toCSVData(databaseFormat: DatabaseFormat) {
    const serialized = this.toJSObject();
    return [serialized.id];
  }

  /**
   * Constructs a `Task` from a plain hash with initialization values.
   *
   * @param plantDb The `PlantDB` to create the log entry in.
   * @param dataObject The hash containing the initialization values for the `Task`.
   * @returns The constructed `Task`.
   */
  static fromJSObject(plantDb: PlantDB, dataObject: TaskSerialized) {
    const task = new Task(
      plantDb,
      dataObject.id,
      dataObject.title,
      new Date(dataObject.date),
      dataObject.time ? new Date(dataObject.time) : undefined
    );

    return task;
  }

  /**
   * Parse a JSON string and construct a new `Task` from it.
   *
   * @param plantDb The `PlantDB` this `Task` belongs to.
   * @param dataString The JSON-serialized task.
   * @returns The new `Task`.
   */
  static fromJSON(plantDb: PlantDB, dataString: string) {
    const data = JSON.parse(dataString) as TaskSerialized;
    return Task.fromJSObject(plantDb, data);
  }

  /**
   * Serialize this log entry into a plain JS hash.
   *
   * @returns A simple hash with all of this log entry's properties.
   */
  toJSObject(): TaskSerialized {
    return {
      id: this.#id,
      title: this.#title,
      date: this.#dateTime,
      time: this.#dateTime,
      notes: this.#notes,
      plantId: this.#plantId,
      repeatInterval: this.#repeatInterval,
      repeatUnit: this.#repeatUnit,
      repeatDays: this.#repeatDays,
      endsOn: this.#endsOn,
      endsAfter: this.#endsAfter,
    };
  }

  /**
   * Pre-serialize the `Task` into an object ready to be turned into a JSON string.
   *
   * @returns The `Task` as JSON-serializable object.
   */
  toJSON() {
    return this.toJSObject();
  }
}
