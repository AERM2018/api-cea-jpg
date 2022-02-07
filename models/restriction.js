const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const Restriction = db.define(
  "restriction",
  {
    id_res: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    restricted_course: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    restricted_extracourse: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    mandatory_course: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    mandatory_course: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Restriction;
