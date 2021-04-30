const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const Student = db.define('students', {
    id_student: {
        type: DataTypes.STRING,
        primaryKey: true,
        autoIncrement: true
    },
    id_user: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    surname_f: {
        type: DataTypes.STRING,
        allowNull: false
    },
    surname_m: {
        type: DataTypes.STRING,
        allowNull: false
    },
    group_chief: {
        type: DataTypes.TINYINT,
        allowNull: false
    },
    curp: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    mobile_number: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mobile_back_number: {
        type: DataTypes.STRING,
        allowNull: false
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    },
    street: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    zip: {
        type : DataTypes.STRING(6),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    colony: {
        type : DataTypes.STRING(30),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    matricula: {
        type: DataTypes.STRING(15),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    birthdate:{
        type: DataTypes.DATE,
        allowNull: false,
    }






}, {
    timestamps: false
})
module.exports = Student;