const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const ExtraCurricularCourses = db.define(
  "extracurricular_courses",
  {
    id_ext_cou: {
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true,
    },
    id_major: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ext_cou_name: {
      type: DataTypes.STRING(15),
      validate: {
        notEmpty: true,
      },
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
    },
    limit_participants: {
      type: DataTypes.TINYINT,
      allowNull: false,
    },
    cost: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    id_teacher: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: true,
    },
    id_time_table: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = ExtraCurricularCourses;
