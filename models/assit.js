const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const Assit = db.define(
  "assits",
  {
    id_assistance: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    date_assistance: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    attended: {
      type: DataTypes.TINYINT,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Assit;
