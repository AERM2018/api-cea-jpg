const {DataTypes} = require("sequelize");
const {db} = require('../database/connection')

const Graduation_courses =  db.define('graduation_courses',{
    id_graduation_course : {
        primaryKey : true,
        type : DataTypes.INTEGER,
        autoIncrement : true
    },
    course_grad_name : {
        type : DataTypes.STRING(25),
        validate : {
            notEmpty : true
        }
    },
    start_date : {
        type : DataTypes.DATE,
        validate : {
            notEmpty : true
        }
    },
    end_date : {
        type : DataTypes.DATE,
        validate : {
            notEmpty : true
        }
    },
    id_teacher : {
        type : DataTypes.STRING(15),
        validate : {
            notEmpty : true
        }
    },
    status:{
        type : DataTypes.TINYINT,
        allowNull : false
    }
},
{
    timestamps : false,
    freezeTableName :true
    }
)

module.exports = Graduation_courses;