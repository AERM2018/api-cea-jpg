const {DataTypes} = require("sequelize");
const {db} = require('../database/connection')


const Graduation_section =  db.define('graduation_sections',{
    id_graduation_section : {
        primaryKey : true,
        type : DataTypes.INTEGER,
        autoIncrement : true
    },
    id_teacher : {
        type : DataTypes.STRING(30),
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
    graduation_section_name: {
        type : DataTypes.STRING(30),
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
    in_progress : {
        type : DataTypes.TINYINT(1),
        defaultValue : true,
        validate : {
            notEmpty : true
        }
    }
},{
    timestamps : false,
    freezeTableName :true
}
)

module.exports = Graduation_section;