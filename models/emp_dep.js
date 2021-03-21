const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const Emp_dep = db.define('emp_dep',{
    id_emp_dep: {
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true
    },
    id_employee: {
        type : DataTypes.STRING,
        allowNull: false,
        validate : {
            notEmpty : true
        }
    },
    id_department: {
        type : DataTypes.INTEGER,
        allowNull: false,
    },

},{
    timestamps : false,
    freezeTableName:true
})
module.exports = Emp_dep;