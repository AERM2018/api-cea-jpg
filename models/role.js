const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const Role = db.define(
  "roles",
  {
    id_role: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    role_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = Role;
