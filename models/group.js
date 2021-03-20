const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const Group = db.define('groupss',{
    id_group: {
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true
    },
    id_major : {
        type : DataTypes.INTEGER,
        allowNull: false
    },
    name_group : {
        type : DataTypes.STRING,
        allowNull: false
    }
    

},{
    timestamps : false,
    freezeTableName :true
})
module.exports = Group;