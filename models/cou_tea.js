const {DataTypes} = require("sequelize");
const {db} = require('../database/connection')


const Cou_tea =  db.define('cou_tea',{
    id_sub_tea : {
        primaryKey : true,
        type : DataTypes.INTEGER,
        autoIncrement : true
    },
    id_course : {
        type : DataTypes.INTEGER,
        validate : {
            notEmpty : true
        }
    },
    id_teacher : {
        type : DataTypes.STRING(30),
        validate : {
            notEmpty : true
        }
    },
    status : {
        type : DataTypes.BOOLEAN,
        defaultValue : true
    },
    start_date : {
        type : DataTypes.DATEONLY,
        validate : {
            notEmpty : true
        }
    },
    end_date : {
        type : DataTypes.DATEONLY
    }
},{
    timestamps : false,
    freezeTableName :true
}
)

module.exports = Cou_tea;