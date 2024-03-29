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
    name: {
      type: DataTypes.STRING,
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
    id_major: {
      type: DataTypes.INTEGER,
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
    id_campus: {
      type: DataTypes.INTEGER,
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
    irregular: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    cont: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
    hooks: {
      afterFind: (record, options) => {
        if (record.constructor === Array) {
          for (var i = 0; i < record.length; i++) {
            record[
              i
            ].student_name = `${record[i].surname_m} ${record[i].surname_f} ${record[i].name}`;
          }
        } else {
          record.student_name = `${record.surname_m} ${record.surname_f} ${record.name}`;
        }
      },
    },
  }
);

module.exports = Stu_info;
