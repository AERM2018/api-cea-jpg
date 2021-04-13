
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
    }
},
{
    timestamps : false
});

module.exports = Document