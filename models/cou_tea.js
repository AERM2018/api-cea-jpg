const {DataTypes} = require("sequelize");
const {db} = require('../database/connection')


const Cou_tea =  db.define('Cou_teas',{
    id_sub_tea : {
        primaryKey : true,
        type : DataTypes.INTEGER,
        autoIncrement : true
    },
    id_course : {
        type : DataTypes.INTEGER
    },
    id_teacher : {
        type : DataTypes.INTEGER
    },
    status : {
        type : DataTypes.STRING
    },
    start_date : {
        type : DataTypes.DATE
    },
    end_date : {
        type : DataTypes.DATE
    }
},{
    timestamps : false
}
)

module.exports = Cou_tea;