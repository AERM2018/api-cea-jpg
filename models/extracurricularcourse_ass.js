const {DataTypes} = require("sequelize");
const {db} = require('../database/connection')


const Extracurricularcourse_ass =  db.define('extracurricularcourses_ass',{
    id_extracurricularcourses_ass : {
        primaryKey : true,
        type : DataTypes.INTEGER,
        autoIncrement : true
    },
    id_ext_cou : {
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

module.exports = Extracurricularcourse_ass;