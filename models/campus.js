const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");
const Campus = db.define(
  "campus",
  {
    id_campus: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    campus_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    street: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    state: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    municipality: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    colony: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    zip: {
      type: DataTypes.STRING(6),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    active: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = Campus;
