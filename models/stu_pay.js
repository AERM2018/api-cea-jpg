const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");
const Payments = require("./payment");
const Student = require("./student");

const Stu_pay = db.define('stu_pay',{
    id_stu_pay : {
        type : DataTypes.INTEGER,
        autoIncrement : true,
        primaryKey : true,
    },
    id_student : {
        type : DataTypes.STRING,
        allowNull : null,
        validate : {
            notEmpty : true
        },
        references : {
            model : Student,
            key : 'id_student'
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

module.exports = Stu_pay;