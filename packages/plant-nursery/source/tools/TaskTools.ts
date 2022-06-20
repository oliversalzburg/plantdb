import { Task, TaskRepeatDays, TaskRepeatInterval, WeekDay } from "@plantdb/libplantdb";
import RRule from "rrule";

export const rruleFromTask = (task: Task) => {
  const rule = new RRule({
    freq: task.repeatFrequency,
    interval: task.repeatInterval ? convertInterval(task.repeatInterval) : undefined,
    byweekday: task.repeatDays?.map(day => convertDay(day)),
    dtstart: task.dateTime,
    until: task.endsOn,
  });
  return rule;
};

export const convertInterval = (repeatInterval: TaskRepeatInterval) => {
  switch (repeatInterval) {
    case "day":
      return RRule.DAILY;
    case "week":
      return RRule.WEEKLY;
    case "month":
      return RRule.MONTHLY;
    case "year":
      return RRule.YEARLY;
    default:
      throw new Error("Unknown or unsupported repeat unit.");
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
