const moment = require("moment");
const Expense = require("../models/expense");
const Emp_exp = require("../models/emp_exp");
const Expenses_types = require("../models/expenses_type");

const { db } = require("../database/connection");
const { expenses_type } = require("../types/dictionaries");
const Employees = require("../models/employee");
const { printAndSendError } = require("../helpers/responsesOfReq");
const { getExpensesInfo } = require("../helpers/getDataSavedFromEntities");
const { Op, fn, col } = require("sequelize");
const { generateExpensesDoc } = require("../helpers/documentGeneration");

const getAllTheExpenses = async (req, res) => {
  try {
    let { fecha = moment().local().format("YYYY-MM-DD") } = req.query;
    const expenses = await getExpensesInfo(undefined, fecha);

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
    const result = await getExpensesInfo(id_expense);
    return res.status(201).json({
      ok: true,
      msg: "Gasto creado correctamente",
      result,
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
    const result = await getExpensesInfo(id);
    return res.status(200).json({
      ok: true,
      msg: `El gasto se actualizo correctamente`,
      result,
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

const createExpensesReport = async( req, res) => {
  let {
    start_date = moment().startOf("month").format("YYYY-MM-DD"),
    end_date = moment().endOf("month").format("YYYY-MM-DD"),
  } = req.query;
  Expenses_types.belongsTo(Expense,{foreignKey:"id_expense"})
  Expense.hasOne(Expenses_types, { foreignKey: "id_expense" });
  try {
    console.log("START",start_date);
    console.log("END",end_date);
    // Find expenses between the dates specified
    let expenses = await Expense.findAll({where:{date:{[Op.between]:[start_date,end_date]}},include:{model: Expenses_types,attributes:{exclude:['id_expense_type','id_expense']}}})
    expenses = expenses.map(expense => {
      let {expenses_type:type,id_expense,...restExpense} = expense.toJSON()
      type.expense_type = expenses_type[type.expense_type]
      return { ...restExpense, ...type };
    })
    // Add salary when it's half of the month of end of the month
    if(moment().date() === 15 || moment().date() === moment().endOf('month').date() || true){
      const employees = await Employees.findAll({where:{salary:{[Op.gt]:0}}, attributes:[[fn('concat',col('name')," ", col('surname_m')," ",col("surname_f")),"employee_name"],'id_employee','salary']})
      employees.map((x) => console.log(x.employee_name));
      const employeeExpenses = employees.map((employee) => ({
        amount: employee.salary,
        date: moment().format("YYYY-MM-DD"),
        expense_type: "Salario quincenal",
        observation: `Pago de salario del empleado: ${employee.toJSON().employee_name}`,
      }));
      expenses = [...expenses,...employeeExpenses]
    }
    expenses = expenses.map((expense) => ({
      ...expense,
      date: moment(expense.date).format("D-MMMM-YY"),
      amount: `$${expense.amount}`,
    }));
    start_date = moment(start_date).format("D-MMMM-YY");
    end_date = moment(end_date).format("D-MMMM-YY");
    const stream = res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
    });
    generateExpensesDoc(
      expenses,
      [start_date,end_date],
      (chunk) => {
        stream.write(chunk);
      },
      () => stream.end()
    );
  } catch (err) {
    printAndSendError(res,err)
  }
}

module.exports = {
  createExpense,
  getAllTheExpenses,
  updateExpense,
  deleteExpense,
  createExpensesReport,
};
