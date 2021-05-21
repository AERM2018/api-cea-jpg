const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const Major = db.define('majors',{
    id_major: {
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true
    },
    id_edu_lev: {
        type : DataTypes.INTEGER,
        allowNull : false
    },
    major_name : {
        type : DataTypes.STRING,
        allowNull: false
    }

},{
    timestamps : false
})
module.exports = Major;