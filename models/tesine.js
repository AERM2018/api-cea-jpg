const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const Tesine = db.define('tesine',{
    id_tesine : {
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true
    },
    grade : {
        type : DataTypes.FLOAT(4),
        allowNull : false
    },
    id_teacher:{
        type: DataTypes.STRING(30),
        allowNull : false
    },
    delivery_date:{
        type: DataTypes.DATE,
        allowNull : false
    },
    observations:{
        type: DataTypes.STRING(200),
        allowNull : true
    },
    accepted_date:{
        type: DataTypes.DATE,
        allowNull : false
    }
},{
    timestamps : false,
})

module.exports = Tesine;