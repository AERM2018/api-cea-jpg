// const { DataTypes } = require('sequelize');
const { DataTypes } = require('sequelize');
const { db } = require('../database/connection');
const Course = db.define('Course',{
    id_course : {
        primaryKey : true,
        autoIncrement : true,
        type : DataTypes.INTEGER
    },
    id_major : {
        type : DataTypes.INTEGER,
        allowNull : false,
    },
    course_name : {
        type : DataTypes.STRING(25),
        allowNull : false,
        validate : {
            notEmpty : true
        }
    }
},{
    timestamps : false
})  

module.exports = Course;