
const moment = require('moment');
const { col } = require('sequelize');
const Gro_tim = require('../models/gro_tim');
const Time_tables = require('../models/time_tables');
const getFirstAndLastDay = (time_table = []) => {
    const begin_of_month = moment().startOf('month').day()
    const end_of_month = moment().endOf('month')
    let first_day_date, last_day_date;

    const first_day = time_table.find(day => day >= begin_of_month)

    if (!first_day) {
        first_day_date = moment().startOf('month').day(time_table[0] + 7)
    } else {
        first_day_date = moment().startOf('month').day(first_day)
    }

    const weeks_missing_month = moment(end_of_month).diff(first_day_date, 'weeks') + 1

    const pre_last_day = first_day_date.clone().add(weeks_missing_month, 'weeks')

    last_day = time_table.reverse().find(day => (first_day_date.month() === pre_last_day.day(day).month()))
    last_day_date = (last_day) ? pre_last_day.day(last_day) : pre_last_day.subtract(1, 'week')

    first_day_date = first_day_date.toDate().toJSON().substr(0, 10)
    last_day_date = last_day_date.toDate().toJSON().substr(0, 10)
    return { first_day: first_day_date, last_day: last_day_date }
}

const getGroupDaysAndOverdue = async( id_group = 0 ) => {
    Time_tables.hasMany(Gro_tim, { foreignKey: 'id_time_table' });
    Gro_tim.belongsTo(Time_tables, { foreignKey: 'id_time_table' });
    const gro_tim = await Gro_tim.findAll({
        where: { id_group },
        include: {
            model: Time_tables,
            attributes: ['day'],
        },
        order: [[col('time_table.day'), 'asc']]
    })

    const time_table_days = gro_tim.map( group_time => group_time.toJSON().time_table.day)

    // 

    const begin_of_month = moment().startOf('month').day()
    const end_of_month = moment().endOf('month')
    let first_day_date, last_day_date;

    const first_day = time_table_days.find(day => day >= begin_of_month)

    if (!first_day) {
        first_day_date = moment().startOf('month').day(time_table_days[0] + 7)
    } else {
        first_day_date = moment().startOf('month').day(first_day)
    }

    const weeks_missing_month = moment(end_of_month).diff(first_day_date, 'weeks') + 1

    const pre_last_day = first_day_date.clone().add(weeks_missing_month, 'weeks')

    last_day = time_table_days.reverse().find(day => (first_day_date.month() === pre_last_day.day(day).month()))
    last_day_date = (last_day) ? pre_last_day.day(last_day) : pre_last_day.subtract(1, 'week')

    first_day_date = first_day_date.toDate().toJSON().substr(0, 10)
    last_day_date = last_day_date.toDate().toJSON().substr(0, 10)

    const overdue = moment().diff(moment(first_day_date),'weeks') * 100;

    console.log(moment().toDate())
    console.log(moment().diff(moment(first_day_date),'weeks'))
    return { first_day : first_day_date, last_day: last_day_date, overdue }
}

module.exports = {
    getFirstAndLastDay,
    getGroupDaysAndOverdue
};
