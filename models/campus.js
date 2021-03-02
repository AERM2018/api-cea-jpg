const { DataTypes } = require('sequelize');
const { db } = require('../database/connection');
const Campus = db.define('Campus',{
    id_campus : {
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true
    },
    id_municipality : {
        type : DataTypes.INTEGER
    },
    campus_name : {
        type : DataTypes.STRING(100)
    },
    address : {
        type : DataTypes.STRING(100)
    }
},{
    timestamps : false
})


module.exports = Campus;