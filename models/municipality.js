const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const Municipality = db.define('Municipality',{
    id_municipality : {
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true
    },
    municipality : {
        type : DataTypes.STRING
    }
},{
    timestamps : false
})

module.exports = Municipality