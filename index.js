const express = require('express');
const cors = require('cors');   
require('dotenv').config()
const { db } = require('./database/connection');
const Server = require('./models/server');

const server = new Server();

db.authenticate()
.then( res => console.log("DB Online"))
.catch( err => {
    console.log("Error al conectar con la base de datos");
        throw err
})
    


server.listen()
