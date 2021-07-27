const { DataTypes} = require("sequelize");
const { db } = require("../database/connection");

const Assit = db.define('assits',{
    id_assistance : {
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true,
    },
    date_assistance : {
        type : DataTypes.DATEONLY,
        allowNull : false,
        defaultValue : new Date()
    },
    attended : {
        type : DataTypes.TINYINT,
        allowNull : false,
        // validate : {
        //     isIn : {msg:"El valor de la asistenica debe ser entre 0 y 2",args : [0,1,2]}
        // }

    }
},
{
    timestamps : false
})

module.exports = Assit;
