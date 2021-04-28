const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const Partial_pay = db.define('partial_pay',{
    id_partial_pay : {
        type : DataTypes.INTEGER,
        autoIncrement : true,
        primaryKey :true
    },
    id_payment : {
        type : DataTypes.INTEGER,
        allowNull : false
    },
    id_card : {
        type : DataTypes.INTEGER,
        allowNull : true
    },
    amount_p : {
        type : DataTypes.FLOAT,
        allowNull : false
    },
    payment_method : {
        type : DataTypes.ENUM('Tarjeta','Depósito','Efectivo'),
        allowNull : true
    },
    date_p : {
        type : DataTypes.DATEONLY,
        allowNull : false
    },
    
},
{
    timestamps : false
})

module.exports = Partial_pay
