const {DataTypes} = require("sequelize");
const {db} = require('../database/connection')


const stu_gracou =  db.define('stu_gracou',{
    id_stu_gracou : {
        primaryKey : true,
        type : DataTypes.INTEGER,
        autoIncrement : true
    },
    id_student : {
        type : DataTypes.STRING(15),
        validate : {
            notEmpty : true
        }
    },
    id_graduation_course : {
        type : DataTypes.INTEGER,
        validate : {
            notEmpty : true
        }
    },
    id_tesine : {
        type : DataTypes.INTEGER,
        validate : {
            notEmpty : true
        }
    }
},
{
    timestamps : false,
    freezeTableName :true
    }
)

module.exports = stu_gracou;