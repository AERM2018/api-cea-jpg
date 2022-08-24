const { DataTypes } = require("sequelize");
const moment = require('moment');
const { db } = require("../database/connection");

const FailedLoginAttemps = db.define(
  "failed_login_attemps",
  {
    id_attemp: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = FailedLoginAttemps;
