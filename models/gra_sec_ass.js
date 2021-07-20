const {DataTypes} = require("sequelize");
const {db} = require('../database/connection')


const Gra_sec_ass =  db.define('gra_sec_ass',{
    id_gra_sec_ass : {
        primaryKey : true,
        type : DataTypes.INTEGER,
        autoIncrement : true
    },
    id_graduation_section : {
        type : DataTypes.INTEGER,
        validate : {
            notEmpty : true
        }
    },
    id_assistance : {
        type : DataTypes.INTEGER,
        validate : {
            notEmpty : true
        }
    },
    id_student : {
        type : DataTypes.STRING(15),
        validate : {
            notEmpty : true
        }
    }
},{
    timestamps : false,
    freezeTableName :true
}
)

module.exports = Gra_sec_ass;