const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const Department = db.define('department',{
    id_department: {
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true
    },
    department_name : {
        type : DataTypes.STRING,
        allowNull: false
    }

},{
    timestamps : false
})
module.exports = Department;