const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const Grades = db.define('grades',{
    id_grade : {
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true
    },
    id_course : {
        type : DataTypes.INTEGER,
        allowNull : false
    },
    id_student : {
        type : DataTypes.INTEGER,
        allowNull : false
    },
    grade : {
        type : DataTypes.FLOAT,
        allowNull : false
    }
},{
    timestamps : false,
    freezeTableName : true
})

module.exports = Grades