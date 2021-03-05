const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const Time_tables = db.define('time_tables',{
    id_time_table: {
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true
    },
    day : {
        type : DataTypes.TINYINT,
        allowNull: false
    },
    start_hour : {
        type : DataTypes.TIME,
        allowNull: false
    },
    finish_hour : {
        type : DataTypes.TIME,
        allowNull: false
    }

},{
    timestamps : false
})
module.exports = Time_tables;