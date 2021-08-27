
const { DataTypes, TINYINT } = require('sequelize');
const { db } = require('../database/connection')

const Document = db.define('document',{
    id_document : {
        type : DataTypes.INTEGER,
        autoIncrement : true,
        primaryKey : true
    },
    document_type : {
        type : TINYINT,
        allowNull : false
    },
    cost : {
        type : DataTypes.FLOAT,
        allowNull : false
    },
    id_student : {
        type : DataTypes.STRING,
        allowNull : false
    },
    creation_date : {
        type : DataTypes.DATEONLY,
        allowNull : true,
        defaultValue : null
    }
},
{
    timestamps : false
});

module.exports = Document