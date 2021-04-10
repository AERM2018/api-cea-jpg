
const moment = require('moment')
const getFisrtAndLastSunday = ( payment_date = '') => {
    const fisrt_sunday = moment( payment_date ).startOf('month').day(7).toDate().toJSON().substr(0,10)
    const last_sunday = moment(fisrt_sunday).add(4,'weeks').toDate().toJSON().substr(0,10)

    return { fisrt_sunday, last_sunday}
}

module.exports = {
    getFisrtAndLastSunday
};
