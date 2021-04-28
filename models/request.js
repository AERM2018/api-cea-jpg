const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const Request = db.define('request',{
    id_request : {
        type : DataTypes.INTEGER,
        autoIncrement : true,
        primaryKey : true
    },
    id_department : {
        type : DataTypes.INTEGER,
        allowNull : false,
    },
    id_document : {
        type : DataTypes.INTEGER,
        allowNull : false,
    },
    id_payment : {
        type : DataTypes.INTEGER,
        allowNull : false,
    },
    status_request: {
        type : DataTypes.TINYINT,
        defaultValue : 0,
        allowNull : true,
    },
    creation_date: {
        type : DataTypes.DATEONLY,
        defaultValue : Date.now(),
        allowNull : true,
    }




},
{
    timestamps : false
})

module.exports = Request