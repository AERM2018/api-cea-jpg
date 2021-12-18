const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const Test = db.define('test',{
    id_test : {
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true,
        allowNull : false
    },
    id_student : {
        type : DataTypes.STRING,
        allowNull : false
    },
    folio : {
        type : DataTypes.INTEGER,
        allowNull : false
    },
    type : {
        type : DataTypes.ENUM(['Ordinario','Extraordinario','Titulación']),
        allowNull : false
    },
    application_date : {
        type : DataTypes.DATEONLY,
        allowNull : false
    }
},
{
    timestamps : false
});

module.exports = Test;
