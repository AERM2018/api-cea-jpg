const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const Gro_cou = db.define('gro_cou',{
    id_gro_cou : {
        type : DataTypes.INTEGER,
        autoIncrement : true,
        primaryKey : true
    },
    id_group : {
        type : DataTypes.INTEGER,
        allowNull : false
    },
    id_course : {
        type : DataTypes.INTEGER,
        allowNull : false
    },
    status : {
        type : DataTypes.BOOLEAN,
        allowNull : false
    },
    start_date : {
        type : DataTypes.DATEONLY,
        allowNull : false
    },
    end_date : {
        type : DataTypes.DATEONLY,
        allowNull : false
    }
},
{
    freezeTableName : true,
    timestamps : false
});


module.exports = Gro_cou;