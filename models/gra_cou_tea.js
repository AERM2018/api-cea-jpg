const {DataTypes} = require("sequelize");
const {db} = require('../database/connection')


const Gra_cou_tea =  db.define('gra_cou_tea',{
    id_gra_cou_tea : {
        primaryKey : true,
        type : DataTypes.INTEGER,
        autoIncrement : true
    },
    id_graduation_course : {
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
    }
},{
    timestamps : false,
    freezeTableName :true
}
)

module.exports = Gra_cou_tea;