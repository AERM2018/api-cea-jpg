const { DataTypes, Sequelize } = require("sequelize");
const moment = require("moment");
const { db } = require("../database/connection");

const Request = db.define(
  "request",
  {
    id_request: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_department: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    },
    id_document: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_payment: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status_request: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      allowNull: true,
    },
    creation_date: {
      type: DataTypes.DATEONLY,
      defaultValue: Sequelize.NOW,
      allowNull: true,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Request;
