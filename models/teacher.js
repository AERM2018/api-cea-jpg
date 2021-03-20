const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const Teacher = db.define('teachers',{
    id_teacher: {
        type : DataTypes.STRING(30),
        primaryKey : true,
        validate : {
            notEmpty : true
        }
    },
    id_user : {
        type : DataTypes.INTEGER,
        allowNull: false
    },
    name : {
        type : DataTypes.STRING,
        allowNull: false
    },
    surname : {
        type : DataTypes.STRING,
        allowNull: false
    },
    rfc : {
        type : DataTypes.STRING,
        allowNull: false
    },
   
    mobile_number : {
        type : DataTypes.STRING,
        allowNull: false
    },
    id_ext_cou : {
        type : DataTypes.INTEGER,
        defaultValue : null
    },
    courses : {
        type : DataTypes.TINYINT,
        defaultValue : 0
    },
    active : {
        type : DataTypes.TINYINT,
        defaultValue : true
    },
   

},{
    timestamps : false
})
module.exports = Teacher;