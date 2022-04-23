const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const Rol_use = db.define(
  "rol_use",
  {
    id_role_use: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    id_role: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = Rol_use;
