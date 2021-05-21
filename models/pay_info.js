const { DataTypes, QueryTypes } = require("sequelize");
const { db } = require("../database/connection");

const Pay_info = db.define('pay_info',{
    id_payment       : {
        type :  DataTypes.INTEGER,
        allowNull : false
    },
    payment_type     : {
        type : DataTypes.ENUM('Documento','Inscripción','Materia'),
        allowNull : false,
        validate : {
            notEmpty : true
        }
    },
    status_payment   : {
        type : DataTypes.INTEGER,
        allowNull : false
    },
    cutoff_date      : {
        type : DataTypes.DATEONLY,
        allowNull : false
    },
    payment_date     : {
        type : DataTypes.DATEONLY,
        allowNull : false
    },
    start_date : {
        type : DataTypes.DATEONLY,
        allowNull : true
    },
    amount           : {
        type : DataTypes.FLOAT,
        allowNull : false
    },
    id_student       : {
        type :DataTypes.STRING,
        allowNull : false,
        validate : {
            notEmpty : true
        }
    },
    id_group         : {
        type : DataTypes.INTEGER,
        allowNull : false
    },
    name_group       : {
        type : DataTypes.STRING,
        allowNull : false,
        validate : {
            notEmpty : true
        }
    },
    major_name : {
        type : DataTypes.STRING,
        allowNull : false,
        validate : {
            notEmpty : true
        }
    },
    current : {
        type : DataTypes.FLOAT,
        allowNull : false
    },
    current : {
        type : DataTypes.STRING,
        allowNull : false
    }

},
{
    timestamps :  false,
    freezeTableName : true
})

module.exports = Pay_info;
