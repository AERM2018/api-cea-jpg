const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const User = db.define('users',{
    id_user: {
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true
    },
    user_type : {
        type : DataTypes.STRING,
        allowNull: false
    },
    email : {
        type : DataTypes.STRING,
        allowNull: false,
        defaultValue : ""
    },
    password : {
        type : DataTypes.STRING,
        allowNull: false
    }

},{
    timestamps : false
})
module.exports = User;