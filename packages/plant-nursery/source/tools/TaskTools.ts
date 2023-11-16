import { Task, TaskRepeatDays, TaskRepeatFrequency, WeekDay } from "@plantdb/libplantdb";
import { DateTime } from "luxon";
import { RRule } from "rrule";

export const convertFrequency = (frequency: TaskRepeatFrequency) => {
  switch (frequency) {
    case "day":
      return RRule.DAILY;
    case "week":
      return RRule.WEEKLY;
    case "month":
      return RRule.MONTHLY;
    case "year":
      return RRule.YEARLY;
    default:
      throw new Error("Unknown or unsupported frequency unit.");
  }
};

export const convertDay = (repeatDay: TaskRepeatDays) => {
  switch (repeatDay) {
    case WeekDay.Monday:
      return RRule.MO;
    case WeekDay.Tuesday:
      return RRule.TU;
    case WeekDay.Wednesday:
      return RRule.WE;
    case WeekDay.Thursday:
      return RRule.TH;
    case WeekDay.Friday:
      return RRule.FR;
    case WeekDay.Saturday:
      return RRule.SA;
    case WeekDay.Sunday:
      return RRule.SU;
    default:
      throw new Error("Unknown or unsupported repeat day.");
  }
};

export const rruleFromTask = (task: Task) => {
  const rule = new RRule({
    count: task.endsAfter,
    freq: task.repeatFrequency ? convertFrequency(task.repeatFrequency) : undefined,
    interval: task.repeatInterval,
    byweekday: task.repeatDays?.map(day => convertDay(day)),
    dtstart: DateTime.fromJSDate(task.dateTime).setZone("utc", { keepLocalTime: true }).toJSDate(),
    until: task.endsOn,
  });
  return rule;
};
