const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");


const Cam_gro = db.define('cam_gro',{
        id_cam_gro : {
            type : DataTypes.INTEGER,
            primaryKey : true,
            autoIncrement : true,
            allowNull : false
        },
        id_campus : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        id_group : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
    },
    {
        timestamps : false,
        freezeTableName : true
    }
)

module.exports = Cam_gro;
