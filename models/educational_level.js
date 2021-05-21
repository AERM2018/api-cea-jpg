const { DataTypes } = require('sequelize')
const { db } = require('../database/connection')
const Educational_level = db.define('educational_level',{
    id_edu_lev : {
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true
    },
    educational_level : {
        type : DataTypes.STRING,
        allowNull : false,
        validate: {
            notEmpty : true
        }
    }
},
{
    timestamps : false,
})

module.exports = Educational_level
