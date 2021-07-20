const {DataTypes} = require("sequelize");
const {db} = require('../database/connection')


const Graduation_section =  db.define('graduation_section',{
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