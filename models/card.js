const { DataTypes, Model } = require('sequelize');
const { db } = require('../database/connection');
const Card = db.define('card',{
    id_card:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_payment: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty:true
        }
    },
    card_number:{
        type: DataTypes.STRING(16),
        allowNull: false,
        validate:{
            notEmpty:true
        }
    },
    owner:{
        type: DataTypes.STRING(20),
        allowNull: false,
        validate:{
            notEmpty:true
        }
    },
    bank:{
        type: DataTypes.STRING(20),
        allowNull: false,
        validate:{
            notEmpty:true
        }
    },
    due_date:{
        type: DataTypes.DATE,
        allowNull: false,
        validate:{
            notEmpty: true
        }
    }
},{
    timestamps : false,
// freezeTableName : true
})

module.exports= Card;