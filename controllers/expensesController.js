const moment = require("moment");
const Expense = require("../models/expense");
const Emp_exp = require("../models/emp_exp");
const Expenses_types = require("../models/expenses_type");

const { db } = require("../database/connection");
const { expenses_type } = require("../types/dictionaries");
const Employees = require("../models/employee");
const { printAndSendError } = require("../helpers/responsesOfReq");

const getAllTheExpenses = async (req, res) => {
  try {
    let { fecha = moment().local().format("YYYY-MM-DD") } = req.query;
    let expenses;
    let condition;

    condition = (date = "all") ? {} : { date };

    Expenses_types.belongsTo(Expense, { foreignKey: "id_expense" });
    Expense.hasOne(Expenses_types, { foreignKey: "id_expense" });

    Emp_exp.belongsTo(Expense, { foreignKey: "id_expense" });
    Expense.hasOne(Emp_exp, { foreignKey: "id_expense" });

    Emp_exp.belongsTo(Employees, { foreignKey: "id_employee" });
    Employees.hasMany(Emp_exp, { foreignKey: "id_employee" });

    expenses = await Expense.findAll({
      include: [
        {
          model: Expenses_types,
          attributes: ["expense_type", "observation"],
        },
        {
          model: Emp_exp,
          include: {
            model: Employees,
            attributes: ["id_employee"],
          },
        },
      ],
      where: condition,
    });

    if (!expenses) {
      return res.status(400).json({
        ok: false,
        msg: "No existen gastos de la fecha " + fecha,
      });
    }

    expenses = expenses.map((expense) => {
      const {
        expenses_type: expense_type,
        emp_exp,
        date,
        ...restoExpense
      } = expense.toJSON();
      const [d, m, y] = moment(date).format(`D MMMM YYYY`).split(" ");
      return {
        ...restoExpense,
        date: `${d} de ${m} de ${y}`,
        expenses_type: expenses_type[expense_type.expense_type],
        observation: expense_type.observation,
        id_employee: emp_exp.employee.id_employee,
      };
    });
    return res.status(200).json({
      ok: true,
      expenses,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Hable con el administrador",
    });
  }
};

const createExpense = async (req, res) => {
  const { id_employee } = req;
  const {
    amount,
    expense_type,
    observation,
    date = moment().local().format("YYYY-MM-DD"),
  } = req.body;

  try {
    // Creando un gasto y obteniendo su id
    const expense = await Expense.create({ amount, date });
    const { id_expense } = expense;
    // Llenando la tabla expenses_types
    await Expenses_types.create({
      id_expense,
      expense_type,
      observation,
    });
    // Llenando la tabla de emp_exo
    await Emp_exp.create({ id_employee, id_expense });
    return res.status(201).json({
      ok: true,
      msg: "Gasto creado correctamente",
    });
  } catch (error) {
    printAndSendError(res, error);
  }
};

const updateExpense = async (req, res) => {
  const { id } = req.params;
  const { amount, observation, expense_type } = req.body;
  try {
    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({
        ok: false,
        msg: "No existe un gasto con el id " + id,
      });
    }
    const expense_details = await Expenses_types.findOne({
      where: { id_expense: id },
    });
    await expense_details.update({ expense_type, observation });
    await expense.update({ amount });

    return res.status(200).json({
      ok: true,
      msg: `El gasto se actualizo correctamente`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Hable con el administrador",
    });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({
        ok: false,
        msg: "No existe un gasto con el id " + id,
      });
    }

    const emp_exp = await Emp_exp.findOne({
      where: { id_expense: id },
    });
    await emp_exp.destroy();

    const expense_types = await Expenses_types.findOne({
      where: { id_expense: id },
    });

    await expense_types.destroy();

    await expense.destroy();

    return res.status(200).json({
      ok: true,
      msg: "El gasto se elimino correctamente",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Hable con el administrador",
    });
  }
};

module.exports = {
  createExpense,
  getAllTheExpenses,
  updateExpense,
  deleteExpense,
};
