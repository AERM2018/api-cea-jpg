const { DataTypes } = require('sequelize');
const { db } = require('../database/connection');
const Expense = db.define('expenses',{
    id_expense : {
        primaryKey : true,
        autoIncrement : true,
        type : DataTypes.INTEGER
    },
    amount : {
        type : DataTypes.FLOAT,
        allowNull : false,
    },
    date : {
        type : DataTypes.DATEONLY,
        allowNull : false,
    }
},{
    timestamps : false
})  

module.exports = Expense;