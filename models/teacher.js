const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const Teacher = db.define('teachers',{
    id_teacher: {
        
        type : DataTypes.STRING(30),
        primaryKey : true,
        validate : {
            notEmpty : true
        },
        
    },
    id_user : {
        type : DataTypes.INTEGER,
        allowNull: false
    },
    name : {
        type : DataTypes.STRING(35),
        allowNull: false
    },
    surname_f : {
        type : DataTypes.STRING(45),
        allowNull: false
    },
    surname_m : {
        type : DataTypes.STRING(45),
        allowNull: false
    },
    rfc : {
        type : DataTypes.STRING(13),
        allowNull: false
    },
   
    mobile_number : {
        type : DataTypes.STRING(10),
        allowNull: false
    },
    courses : {
        type : DataTypes.TINYINT(1),
        defaultValue : 0
    },
    active : {
        type : DataTypes.TINYINT(1),
        defaultValue : 1
    },
   

},{
    timestamps : false,
})
module.exports = Teacher;