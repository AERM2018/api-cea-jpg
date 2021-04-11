
const { DataTypes } = require('sequelize')
const { db } = require('../database/connection')

const Card_pay = db.define('card_pay',{
    id_card_pay : {
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true
    },
    id_card : {
        type : DataTypes.INTEGER,
        allowNull : false
    },
    id_payment : {
        type : DataTypes.INTEGER,
        allowNull : false
    }
},
{
    timestamps : false,
    freezeTableName : true
});

module.exports = Card_pay
