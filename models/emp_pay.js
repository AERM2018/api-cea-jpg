const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");
const Employees = require("./employee");
const Payments = require("./payment");

const Emp_pay = db.define('emp_pay',{
    id_emp_pay : {
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
        references : {
            model : Employees,
            key : 'id_employee'
        }
    },
    id_payment : {
        type : DataTypes.INTEGER,
        allowNull : null,
        references : {
            model : Payments,
            key : 'id_payment'
        }
    },
},{
    timestamps : false,
    freezeTableName : true
})

module.exports = Emp_pay