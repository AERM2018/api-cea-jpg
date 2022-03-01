const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const Stu_info = db.define(
  "stu_info",
  {
    id_student: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    curp: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    mobile_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mobile_back_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    surname_f: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    surname_m: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    street: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    colony: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    zip: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    birthdate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    birthplace: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    matricula: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    id_group: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name_group: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    major_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    educational_level: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    campus_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ins_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    general_avg: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = Stu_info;
