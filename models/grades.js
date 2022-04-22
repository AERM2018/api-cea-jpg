const { DataTypes, literal } = require("sequelize");
const { db } = require("../database/connection");

const Grades = db.define(
  "grades",
  {
    id_grade: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_course: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_student: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    grade: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    creation_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: literal("now()"),
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = Grades;
