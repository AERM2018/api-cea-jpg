const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const Stu_extracou = db.define(
  "stu_extracou",
  {
    id_stu_extracou: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_student: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    id_ext_cou: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    grade: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    id_stu_pay: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = Stu_extracou;
