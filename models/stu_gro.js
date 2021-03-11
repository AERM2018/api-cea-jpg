const {DataTypes} = require('sequelize');
const {db} = require('../database/connection');

const Stu_gro = db.define('stu_gro',{
    id_stu_gto : {
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true,
    },
    id_student : {
        type : DataTypes.STRING(15),
        allowNull : false,
        validate : {
            notEmpty : true
        }
    },
    id_group : {
        type : DataTypes.INTEGER,
        allowNull : false,
    }
})


module.exports = Stu_gro;