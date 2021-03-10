const { DataTypes } = require('sequelize')
const { db } = require('../database/connection')


const Scholarship = db.define('Scholarship',{
    id_scholarship : {
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true,
    },
   
    scholarship_name : {
        type : DataTypes.STRING(15),
        allowNull : false,
        validate : {
            notEmpty : true
        }
    },
    percentage : {
        type : DataTypes.FLOAT,
        allowNull : false,
    },
    reason : {
        type : DataTypes.STRING(100),
        allowNull : false,
        validate : {
            notEmpty : true
        }
    },
    observations : {
        type : DataTypes.STRING(200),
    },
},{
    timestamps : false
});

module.exports = Scholarship;