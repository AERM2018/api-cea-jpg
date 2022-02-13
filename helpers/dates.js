const moment = require("moment");
const { col } = require("sequelize");
const Gro_tim = require("../models/gro_tim");
const Time_tables = require("../models/time_tables");

const getGroupDaysAndOverdue = async (
  id_group = 0,
  date = {},
  year = moment().year()
) => {
  Time_tables.hasMany(Gro_tim, { foreignKey: "id_time_table" });
  Gro_tim.belongsTo(Time_tables, { foreignKey: "id_time_table" });
  const gro_tim = await Gro_tim.findAll({
    where: { id_group },
    include: {
      model: Time_tables,
      attributes: ["day"],
    },
    order: [[col("time_table.day"), "asc"]],
  });

  const time_table_days = gro_tim.map(
    (group_time) => group_time.toJSON().time_table.day
  );

  // Find the first of month in which the student attends class

  const begin_of_month = moment({ month: date, year }).local().startOf("month");
  const end_of_month = moment({ month: date, year }).local().endOf("month");
  let first_day_date, last_day_date;
  const first_day = time_table_days.find((day) => day >= begin_of_month.day());

  if (first_day == undefined) {
    first_day_date = moment({ month: date, year })
      .local()
      .startOf("month")
      .day(time_table_days[0] + 7);
  } else {
    first_day_date = moment({ month: date, year })
      .local()
      .startOf("month")
      .day(first_day);
  }

  const weeks_missing_month = moment(end_of_month).diff(
    first_day_date,
    "weeks"
  );

  // Find the last day in which the stdent attends class
  last_day_date = first_day_date.clone().add(weeks_missing_month, "weeks");
  if (time_table_days.length > 1) {
    // const pre_last_day = first_day_date.clone().add(weeks_missing_month, "weeks");
    [{ date }] = time_table_days
      .map((day) =>
        last_day_date
          .clone()
          .day(last_day_date.clone().day() >= day ? day + 7 : day)
      )
      .map((date) => ({
        date,
        diffFromEndMonth: end_of_month.diff(date.clone(), "days"),
      }))
      .filter((possibleDate) => possibleDate.diffFromEndMonth >= 0)
      .sort((a, b) => a.diffFromEndMonth - b.diffFromEndMonth);
    last_day_date = date;
  }
  first_day_date = first_day_date.format().substr(0, 10);
  last_day_date = last_day_date.format().substr(0, 10);

  let overdue;
  if (
    moment({ month: date, year }).month() === moment().month() &&
    moment({ month: date, year }).year() === moment().year()
  ) {
    overdue = moment().local().diff(moment(first_day_date), "weeks") * 100;
  } else if (
    (moment({ month: date, year }).month() < moment().month() &&
      moment({ month: date, year }).year() === moment().year()) ||
    (moment({ month: date, year }).month() > moment().month() &&
      moment({ month: date, year }).year() < moment().year())
  ) {
    overdue =
      moment({ month: date, year })
        .endOf("month")
        .diff(moment(first_day_date), "weeks") * 100;
  } else {
    overdue = 0;
  }
  return { first_day: first_day_date, last_day: last_day_date, overdue };
};

const findAssistenceDays = (days, first_day, last_day) => {
  const first_day_date = moment(first_day);
  const last_day_date = moment(last_day);

  let assistence_days_dates = [];
  let current_date = first_day_date;
  let nextDay = days[0];
  let daysToAdd = (nextDay += 7);
  while (moment(current_date) <= last_day_date) {
    assistence_days_dates.push(current_date.format("YYYY-MM-DD"));
    if (days.length > 1) {
      nextDay = days.find((day) => day > moment(current_date).day());
      if (nextDay === undefined) nextDay = days[0];
      daysToAdd = nextDay < moment(current_date).day() ? nextDay + 7 : nextDay;
    }
    current_date = moment(current_date).day(daysToAdd);
  }
  return assistence_days_dates;
};
module.exports = {
  getGroupDaysAndOverdue,
  findAssistenceDays,
};
