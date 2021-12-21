const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const Forgot_pass_code = db.define('forgot_pass_code',{
    id_forgot_pass_code:{
        type:DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true,
    },
    code:{
        type:DataTypes.STRING(8),
        allowNull:false
    },
    issued_at:{
        type:DataTypes.DATE,
        allowNull:false
    },
    expirate_at:{
        type:DataTypes.DATE,
        allowNull:false
    },
    id_user:{
        type:DataTypes.INTEGER,
        allowNull:false
    }
},{
    timestamps:false
});

module.exports = Forgot_pass_code;
