const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const Municipality = db.define('Municipality',{
    id_municipality : {
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true
    },
    id_state : {
        type : DataTypes.INTEGER,
        allowNull : false
    },
    municipality : {
        type : DataTypes.STRING,
        unique : true
    }
},{
    timestamps : false
})

module.exports = Municipality