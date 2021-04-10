const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const Pay_info = db.define('pay_info',{
    id_payment       : {
        type :  DataTypes.INTEGER,
        allowNull : false
    },
    payment_method   : {
        type : DataTypes.ENUM('Tarjeta','Depósito','Efectivo'),
        allowNull : false,
        validate : {
            notEmpty : true
        }
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
    amount           : {
        type : DataTypes.FLOAT,
        allowNull : false
    },
    matricula        : {
        type : DataTypes.STRING,
        allowNull : false,
        validate : {
            notEmpty : true
        }
    },
    id_student       : {
        type :DataTypes.STRING,
        allowNull : false,
        validate : {
            notEmpty : true
        }
    },
    student_fullname : {
        type :DataTypes.STRING,
        allowNull : false,
        validate : {
            notEmpty : true
        }
    },
    id_employee      : {
        type :DataTypes.STRING,
        allowNull : false,
        validate : {
            notEmpty : true
        }
    },
    employee_fullname: {
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
    }
},
{
    timestamps :  false,
    freezeTableName : true
})

module.exports = Pay_info;
