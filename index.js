const express = require('express');
const cors = require('cors');   
require('dotenv').config()
const { db } = require('./database/connection');
const Server = require('./models/server');
const moment = require('moment');

moment.tz('America/Mexico_City')

moment.updateLocale('en', {
    months : [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
});
// console.log(moment().startOf('week').day())

const server = new Server();

db.authenticate()
.then( res => console.log("DB Online"))
.catch( err => {
    console.log("Error al conectar con la base de datos");
        throw err
})
    


server.listen()
