// const { DataTypes } = require('sequelize');
const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");
const Course = db.define(
  "courses",
  {
    id_course: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    id_major: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    course_name: {
      type: DataTypes.STRING(25),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    clave: {
      type: DataTypes.STRING(5),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    credits: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Course;
