const { DataTypes } = require('sequelize');
const { db } = require('../database/connection');
const Emp_exp = db.define('emp_exp',{
    id_emp_exp : {
        primaryKey : true,
        autoIncrement : true,
        type : DataTypes.INTEGER
    },
    id_employee : {
        type : DataTypes.STRING(30),
        allowNull : false,
    },
    id_expense : {
        type : DataTypes.INTEGER,
        allowNull : false,
    }
},{
    timestamps : false,
    freezeTableName :true
})  

module.exports = Emp_exp;