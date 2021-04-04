const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const Payment = db.define('payment',{
    id_payment : {
        type : DataTypes.INTEGER,
        autoIncrement : true,
        primaryKey : true,
       
    },
    payment_method : {
        type : DataTypes.ENUM('Tarjeta','Depósito','Efectivo'),
        allowNull : null,
        validate : {
            notEmpty : true
        }
    },
    payment_type : {
        type : DataTypes.ENUM('Documento','Inscripción','Materia'),
        allowNull : null,
        validate : {
            notEmpty : true
        }
    },
    status_payment : {
        type : DataTypes.BOOLEAN,
        allowNull : null
    },
    cutoff_date : {
        type : DataTypes.DATE,
        allowNull : null
    },
    payment_date : {
        type : DataTypes.DATE,
        defaultValue : Date.now()
    },
    amount : {
        type : DataTypes.INTEGER,
        allowNull : false,
    },
},
{
    timestamps : false
})

module.exports = Payment