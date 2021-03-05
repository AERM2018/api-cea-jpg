const {DataTypes} = require("sequelize");
const {db} = require('../database/connection')


const Emp_tim =  db.define('emp_tim',{
    id_emp_tim : {
        primaryKey : true,
        type : DataTypes.INTEGER,
        autoIncrement : true
    },
    id_employee : {
        type : DataTypes.INTEGER
    },
    id_time_table : {
        type : DataTypes.INTEGER
    }
},{
    timestamps : false
}
)

module.exports = Emp_tim;