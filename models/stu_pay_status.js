
// This is a view
const { DataTypes } = require('sequelize')
const { db } = require('../database/connection')
const Stu_pay_status = db.define('stu_pay_status',{
    id_payment : {
        type : DataTypes.INTEGER
    },
    payment_type : {
        type : DataTypes.ENUM('Documento','Inscripción','Materia')
    },
    status_payment : {
        type : DataTypes.BOOLEAN
    },
    id_student : {
        type : DataTypes.STRING(15)
    },
    payment_date : {
        type : DataTypes.DATEONLY
    },
    
},
{
    timestamps : false,
    freezeTableName : true
});

module.exports = Stu_pay_status