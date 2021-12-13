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
    // FIXME:VOLVER A ACTIVAR ESTE CAMPO
    // id_teacher : {
    //     type : DataTypes.STRING(30),
    //     validate : {
    //         notEmpty : true
    //     }
    // }
},
{
    timestamps : false,
    freezeTableName :true
    }
)

module.exports = Graduation_courses;