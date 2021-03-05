const { DataTypes } = require('sequelize');
const { db } = require('../database/connection');
const Campus = db.define('Campus',{
    id_campus : {
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true
    },
    id_municipality : {
        type : DataTypes.INTEGER,
        allowNull : false
    },
    campus_name : {
        type : DataTypes.STRING(100),
        allowNull : false,
        validate : {
            notEmpty : true
        }
    },
    address : {
        type : DataTypes.STRING(100),
        allowNull : false,
        validate : {
            notEmpty : true
        }
    }
},{
    timestamps : false,
    freezeTableName : true
})


module.exports = Campus;