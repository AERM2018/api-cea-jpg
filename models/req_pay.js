const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const Req_pay = db.define('req_pay',{
    id_request : {
        type : DataTypes.INTEGER,
        autoIncrement : true,
        primaryKey : true
    },
    id_payment : {
        type : DataTypes.INTEGER,
        allowNull : false,
    },
    status_payment : {
        type : DataTypes.TINYINT,
        allowNull : false,
    },
    name : {
        type : DataTypes.TINYINT,
        allowNull : false,
    },
    cost : {
        type : DataTypes.FLOAT,
        allowNull : false,
    },
    


},
{
    timestamps : false,
    freezeTableName : true
})

module.exports = Req_pay