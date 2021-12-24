const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const Test = db.define('test',{
    id_test:{
        type : DataTypes.INTEGER,
        autoIncrement : true,
        primaryKey : true,
        allowNull : false
    },
    id_student : {
        type : DataTypes.STRING(15),
        allowNull : false
    },
    id_gro_cou : {
        type : DataTypes.INTEGER,
        allowNull : false
    },
    folio : {
        type : DataTypes.INTEGER,
        allowNull : false
    },
    type : {
        type : DataTypes.ENUM('Ordinario','Extraordinario'),
        allowNull : false
    },
    application_date : {
        type : DataTypes.DATEONLY,
        allowNull : false
    },
    assigned_test_date : {
        type : DataTypes.DATEONLY,
        allowNull : true
    },
    applied : {
        type : DataTypes.TINYINT,
        allowNull : false
    },
    id_grade : {
        type : DataTypes.INTEGER,
        allowNull : false
    }
},{
    timestamps : false
});

module.exports = Test;
