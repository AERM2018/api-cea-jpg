const express = require('express');
const cors = require('cors');   
require('dotenv').config()
const { db } = require('./database/connection');
const Server = require('./models/server');
const moment = require('moment');

moment.updateLocale("en", { week: {
    dow: 1, // First day of week is Monday
    doy: 7  // First week of year must contain 1 January (7 + 1 - 1)
  }});

// console.log(moment().startOf('week').day())

const server = new Server();

db.authenticate()
.then( res => console.log("DB Online"))
.catch( err => {
    console.log("Error al conectar con la base de datos");
        throw err
})
    


server.listen()
