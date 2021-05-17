const { DataTypes } = require('sequelize');
const { db } = require('../database/connection');
const Expenses_types = db.define('expenses_types',{
    id_expense_type : {
        primaryKey : true,
        autoIncrement : true,
        type : DataTypes.INTEGER
    },
    id_expense : {
        type : DataTypes.INTEGER,
        allowNull : false,
    },
    expense_type : {
        type : DataTypes.TINYINT(2),
        allowNull : false,
    },
    observation: {
        type: DataTypes.STRING(50),
        allowNull: false
    }
    
},{
    timestamps : false
})  

module.exports = Expenses_types;