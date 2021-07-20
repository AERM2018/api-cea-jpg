const {DataTypes} = require("sequelize");
const {db} = require('../database/connection')


const Gro_cou_ass =  db.define('gro_cou_ass',{
    id_gro_cou_ass : {
        primaryKey : true,
        type : DataTypes.INTEGER,
        autoIncrement : true
    },
    id_gro_cou : {
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

module.exports = Gro_cou_ass;