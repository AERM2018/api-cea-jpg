const { response } = require("express")
const moment = require('moment');

const isValidSchedule = ( req, res = response, next) => {
    const { time_tables } = req.body

    const invalidDay = time_tables.find( ({ day }) => (day < 0 || day > 6) || day === null)
    const invalidHour = time_tables.find( ({ start_hour, finish_hour }) =>  {
        const start = start_hour.split(':');
        const finish = finish_hour.split(':');

        if(start.map( time => Number(time)).includes(NaN)  || finish.map( time => Number(time)).includes(NaN)){
            return true
        }

        if(moment({
            hours : finish[0], 
            minutes : finish[1],
            seconds : finish[2],
        }).isSameOrBefore(moment({
            hours : start[0],
            minutes : start[1],
            seconds : start[2],
        }))){
            return true
        }
    } )
   

    if( invalidDay ){
        return res.status(400).json({
            ok : false,
            msg : 'Verifique el horario, los días deben de ser entre Lunes y Domingo para ser válidos.'
        })
    }
    if( invalidHour ){
        return res.status(400).json({
            ok : false,
            msg : 'Verifique el horario, la hora de fin debe de ser mayor a la hora de inicio'
        })
    }
    
    next()
}
module.exports = {
    isValidSchedule
}