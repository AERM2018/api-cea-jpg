const {DataTypes} = require("sequelize");
const {db} = require('../database/connection')
const State =  db.define('states',{
    id_state : {
        primaryKey : true,
        type : DataTypes.INTEGER,
        autoIncrement : true
    },
    state : {
        type : DataTypes.STRING
    }
},{
    timestamps : false
}
)

module.exports = State;