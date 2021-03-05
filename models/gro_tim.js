const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const Gro_tim = db.define('gro_tim',{
    id_gro_tim: {
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true
    },
    id_group : {
        type : DataTypes.INTEGER,
        allowNull: false
    },
    id_time_table : {
        type : DataTypes.STRING,
        allowNull: false
    }
   

},{
    timestamps : false
})
module.exports = Gro_tim;