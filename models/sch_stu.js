const { DataTypes } = require('sequelize')
const { db } = require('../database/connection')


const Sch_stu = db.define('sch_stu',{
    id_sch_stu : {
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true,
    },
    id_scholarship : {
        type : DataTypes.INTEGER,
        allowNull : false
    },
    id_student : {
        type : DataTypes.INTEGER,
        allowNull : false
    }
},{
    timestamps : false,
    freezeTableName : true
});

module.exports = Sch_stu;