const {DataTypes} = require("sequelize");
const {db} = require('../database/connection')


const ExtraCurricularCourses =  db.define('extracurricular_courses',{
    id_ext_cou: {
        primaryKey : true,
        type : DataTypes.INTEGER,
        autoIncrement : true
    },
    id_major: {
        type : DataTypes.INTEGER,
        validate : {
            notEmpty : true
        }
    },
    ext_cou_name: {
        type : DataTypes.STRING(15),
        validate : {
            notEmpty : true
        }
    },
    start_date: {
        type : DataTypes.DATE,
        validate : {
            notEmpty : true
        }
    },
    end_date: {
        type : DataTypes.DATE
    },
    limit_participants: {
        type : DataTypes.TINYINT,
        validate : {
            notEmpty : true
        }
    },
    cost: {
        type : DataTypes.FLOAT,
        validate : {
            notEmpty : true
        }
    },
    id_teacher: {
        type : DataTypes.STRING(30),
        validate : {
            notEmpty : true
        }
    },
    status:{
        type : DataTypes.TINYINT,
        allowNull : false
    }
},{
    timestamps : false,
    freezeTableName :true
}
)

module.exports = ExtraCurricularCourses;