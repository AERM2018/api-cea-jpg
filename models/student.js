const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const Student = db.define('students',{
    id_student: {
        type : DataTypes.STRING,
        primaryKey : true,
        autoIncrement : true
    },
    id_user : {
        type : DataTypes.INTEGER,
        allowNull: false
    },
    name : {
        type : DataTypes.STRING,
        allowNull: false
    },
    surname_f : {
        type : DataTypes.STRING,
        allowNull: false
    },
    surname_m : {
        type : DataTypes.STRING,
        allowNull: false
    },
    group_chief : {
        type : DataTypes.TINYINT,
        allowNull: false
    },
    curp : {
        type : DataTypes.STRING,
        allowNull: false
    },
    status : {
        type : DataTypes.INTEGER,
        defaultValue : 1
    },
    mobile_number : {
        type : DataTypes.STRING,
        allowNull: false
    },
    mobile_back_number : {
        type : DataTypes.STRING,
        allowNull: false
    },
    address : {
        type : DataTypes.STRING,
        allowNull: false
    },
    start_date : {
        type : DataTypes.DATE,
        allowNull: false
    },
    end_date : {
        type : DataTypes.DATE,
        
    },
    complete_documents : {
        type : DataTypes.TINYINT,
        allowNull: false
    },


},{
    timestamps : false
})
module.exports = Student;