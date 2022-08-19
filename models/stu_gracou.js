const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const Stu_gracou = db.define(
  "stu_gracou",
  {
    id_stu_gracou: {
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true,
    },
    id_student: {
      type: DataTypes.STRING(15),
      validate: {
        notEmpty: true,
      },
    },
    id_graduation_course: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: true,
      },
    },
    grade: {
      type: DataTypes.STRING,
      defaultValue: "-",
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = Stu_gracou;
