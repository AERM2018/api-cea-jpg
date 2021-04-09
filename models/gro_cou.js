const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const Gro_cou = db.define('gro_cou',{
    id_gro_cou : {
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true
    },
    id_group : {
        type : DataTypes.INTEGER,
        allowNull: false
    },
    id_course : {
        type : DataTypes.INTEGER,
        allowNull: false
    },
    status : {
        type : DataTypes.TINYINT,
        defaultValue: 1
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_date: {
        type : DataTypes.DATE,
        allowNull: false
    }
   

},{
    timestamps : false,
    freezeTableName :true
})
module.exports = Gro_cou;