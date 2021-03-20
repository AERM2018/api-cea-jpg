const { DataTypes } = require('sequelize');
const { db } = require('../database/connection');
const Campus = db.define('campus',{
    id_campus : {
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true
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
    },
    state : {
        type : DataTypes.STRING(50),
        allowNull : false,
        validate : {
            notEmpty : true
        }
    },
    municipality : {
        type : DataTypes.STRING(50),
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