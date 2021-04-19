const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const Emp_par_pay = db.define('emp_par_pay',{
    id_emp_par_pay : {
        type : DataTypes.INTEGER,
        autoIncrement : true,
        primaryKey : true,
    },
    id_employee : {
        type : DataTypes.STRING,
        allowNull : null,
        validate : {
            notEmpty : true
        },
    },
    id_partial_pay : {
        type : DataTypes.INTEGER,
        allowNull : null,
    },
},{
    timestamps : false,
    freezeTableName : true
})

module.exports = Emp_par_pay