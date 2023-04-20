const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const Payment = db.define(
  "payment",
  {
    id_payment: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    payment_type: {
      type: DataTypes.ENUM(
        "Documento",
        "Inscripción",
        "Materia",
        "Curso extracurricular"
      ),
      allowNull: null,
      validate: {
        notEmpty: true,
      },
    },
    status_payment: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    cutoff_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    payment_date: {
      type: DataTypes.DATEONLY,
      defaultValue: Date.now(),
      allowNull: true,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    discount: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Payment;
