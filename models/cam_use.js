const {DataTypes} = require("sequelize");
const {db} = require('../database/connection')


const Cam_use =  db.define('Cam_use',{
    id_cam_use : {
        primaryKey : true,
        type : DataTypes.INTEGER,
        autoIncrement : true
    },
    id_campus : {
        type : DataTypes.INTEGER
    },
    id_user : {
        type : DataTypes.INTEGER
    }
  
},{
    timestamps : false,
    freezeTableName :true
}
)

module.exports = Cam_use;