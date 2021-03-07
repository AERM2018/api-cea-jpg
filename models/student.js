const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const Student = db.define('students',{
    id_student: {
        type : DataTypes.INTEGER,
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
    surname : {
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
        type : DataTypes.STRING,
        allowNull: false
    },
    mobile_number : {
        type : DataTypes.INTEGER,
        allowNull: false
    },
    mobile_back_number : {
        type : DataTypes.INTEGER,
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
        allowNull: false
    },
    complete_documents : {
        type : DataTypes.TINYINT,
        allowNull: false
    },


},{
    timestamps : false
})
module.exports = Student;