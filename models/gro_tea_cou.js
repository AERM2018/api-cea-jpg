const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const Gro_tea_cou = db.define(
  "gro_tea_cou",
  {
    id_gro_tea_cou: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_gro_cou: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_cou_tea: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = Gro_tea_cou;
