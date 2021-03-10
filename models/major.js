const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const Major = db.define('majors',{
    id_major: {
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true
    },
    major_name : {
        type : DataTypes.STRING,
        allowNull: false
    }

},{
    timestamps : false
})
module.exports = Major;