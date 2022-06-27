import { DateTime } from "luxon";
import { intFromCSV, valueFromCSV } from "./csv/Tools";
import { DatabaseFormat } from "./DatabaseFormat";
import { PlantDB } from "./PlantDB";
import { PlantDBEntity } from "./PlantDBEntity";

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
   * The time of the day at which the task should be triggered.
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
   * @inheritDoc Task.repeatFrequency
   */
  repeatFrequency?: TaskRepeatFrequency;

  /**
   * @inheritDoc Task.repeatDays
   */
  repeatDays?: Array<TaskRepeatDays>;

  /**
   * @inheritDoc Task.endsOn
   */
  endsOn?: Date;

  /**
   * @inheritDoc Task.endsAfter
   */
  endsAfter?: number;
};

export const Interval = {
  Daily: "day",
  Weekly: "week",
  Monthly: "month",
  Yearly: "year",
};
export type TaskRepeatFrequency = typeof Interval[keyof typeof Interval];

export const WeekDay = {
  Monday: "monday",
  Tuesday: "tuesday",
  Wednesday: "wednesday",
  Thursday: "thursday",
  Friday: "friday",
  Saturday: "saturday",
  Sunday: "sunday",
} as const;
export type TaskRepeatDays = typeof WeekDay[keyof typeof WeekDay];

/**
 * A task relating to plants in the PlantDB.
 *
 * Tasks are something that the user wants to do at a certain point in time.
 * The user will create tasks with the intention to be reminded about these
 * future actions.
 */
export class Task extends PlantDBEntity {
  #plantDb: PlantDB;
  #id: number;
  #title: string;
  #date: Date;
  #time?: Date;
  #notes: string | undefined;
  #plantId: string | Array<string> | undefined;
  #repeatFrequency: TaskRepeatFrequency | undefined;
  #repeatInterval: number | undefined;
  #repeatDays: Array<TaskRepeatDays> | undefined;
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
    return this.#date;
  }

  /**
   * The time of the day at which this task should be triggered.
   */
  get time() {
    return this.#time;
  }

  /**
   * The date, including the time of day, at which this task should be triggered.
   */
  get dateTime() {
    const dateSource = DateTime.fromJSDate(this.#date);
    if (this.#time) {
      const timeSource = DateTime.fromJSDate(this.#time);
      return dateSource
        .set({
          hour: timeSource.get("hour"),
          minute: timeSource.get("minute"),
          second: timeSource.get("second"),
          millisecond: timeSource.get("millisecond"),
        })
        .toJSDate();
    }

    return dateSource.startOf("day").toJSDate();
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
   * How far individual repetitions are spaced apart (daily, weekly, ...).
   */
  get repeatFrequency(): TaskRepeatFrequency | undefined {
    return this.#repeatFrequency;
  }

  /**
   * Which repetitions out of the given frequency should actually be used.
   */
  get repeatInterval(): number | undefined {
    return this.#repeatInterval;
  }

  /**
   * The days of the week at which to repeat this task.
   */
  get repeatDays() {
    return this.#repeatDays;
  }

  /**
   * `true` if this is a task that should repeat; `false` otherwise.
   */
  get repeats() {
    return (
      (this.#repeatFrequency && this.#repeatInterval) ||
      (Array.isArray(this.#repeatDays) && 0 < this.#repeatDays.length)
    );
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
    super();

    this.#plantDb = plantDb;
    this.#id = id;
    this.#title = title;

    this.#date = date;
    this.#time = time;
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
      initializer?.date ?? other.#date,
      initializer?.time ?? other.#time
    );
    task.#notes = initializer?.notes ?? other.#notes;
    task.#plantId = initializer?.plantId ?? other.#plantId;
    task.#repeatFrequency = initializer?.repeatFrequency ?? other.#repeatFrequency;
    task.#repeatInterval = initializer?.repeatInterval ?? other.#repeatInterval;
    task.#repeatDays = initializer?.repeatDays ?? other.#repeatDays;
    task.#endsOn = initializer?.endsOn ?? other.#endsOn;
    task.#endsAfter = initializer?.endsAfter ?? other.#endsAfter;
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

    const task = new Task(
      plantDb,
      id,
      title,
      DateTime.fromFormat(date, databaseFormat.dateFormat, {
        zone: databaseFormat.timezone,
      }).toJSDate()
    );

    return task;
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
    task.#notes = dataObject.notes ?? task.#notes;
    task.#plantId = dataObject.plantId ?? task.#plantId;
    task.#repeatFrequency = dataObject.repeatFrequency ?? task.#repeatFrequency;
    task.#repeatInterval = dataObject.repeatInterval ?? task.#repeatInterval;
    task.#repeatDays = dataObject.repeatDays ?? task.#repeatDays;
    task.#endsOn = dataObject.endsOn ?? task.#endsOn;
    task.#endsAfter = dataObject.endsAfter ?? task.#endsAfter;

    return task;
  }

  /**
   * Parse a JSON object and construct a new `Task` from it.
   *
   * @param plantDb The `PlantDB` this `Task` belongs to.
   * @param data The JSON-serialized task.
   * @returns The new `Task`.
   */
  static fromJSON(plantDb: PlantDB, data: TaskSerialized) {
    return Task.fromJSObject(plantDb, data);
  }

  /**
   * Parse a JSON string and construct a new `Task` from it.
   *
   * @param plantDb The `PlantDB` this `Task` belongs to.
   * @param dataString The JSON-serialized task as a string.
   * @returns The new `Task`.
   */
  static fromJSONString(plantDb: PlantDB, dataString: string) {
    return Task.fromJSON(plantDb, JSON.parse(dataString) as TaskSerialized);
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
      date: this.#date,
      time: this.#time,
      notes: this.#notes,
      plantId: this.#plantId,
      repeatFrequency: this.#repeatFrequency,
      repeatInterval: this.#repeatInterval,
      repeatDays: this.#repeatDays,
      endsOn: this.#endsOn,
      endsAfter: this.#endsAfter,
    };
  }

  /** @inheritDoc */
  override toJSON() {
    return this.toJSObject();
  }
}
