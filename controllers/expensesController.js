const moment = require('moment');
const Expense = require('../models/expense');
const Emp_exp = require('../models/emp_exp');
const Expenses_types = require('../models/expenses_type');

const { db } = require('../database/connection');
const { expenses_type } = require("../types/dictionaries");

const getAllTheExpenses = async (req, res) => {
    let { fecha = moment().local().format("YYYY-MM-DD") } = req.query;
    const { id_employee } = req.id_employee

    try {




    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador"
        })
    }
}

const createExpense = async (req, res) => {

    const { id_employee } = req.id_employee
    const { amount, expense_type, observation,
        date = moment().local().format("YYYY-MM-DD") } = req.body
    let id_expense
    try {
        // Creando un gasto y obteniendo su id
        const expense = new Expense({ amount, date });
        const newExpense = await expense.save();
        const expenseJson = newExpense.toJSON(); l
        id_expense = expenseJson['id_expense']

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador"
        })
    }
    try {
        // Llenando la tabla expenses_types
        const expense_types = new Expenses_types({ id_expense, expense_type, observation });
        await expense_types.save();
        



    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador"
        })
    }

    try {
        // Llenando la tabla de emp_exo
        const emp_exp = new Emp_exp({ id_employee, id_expense });
        await emp_exp.save();

        
        return res.status(201).json({
            ok: true,
            msg: "Gasto creado correctamente"
        })


        
    } catch ( error ) {
        console.log( error )
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador"
        })
    }



}


const updateExpense = async (req, res) => {

    const { id } = req.params;
    try {


    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador"
        })
    }
}

const deleteExpense = async (req, res) => {
    const { id } = req.params;

    try {

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador"
        })
    }
}


module.exports = {
    createExpense,
    getAllTheExpenses,
    updateExpense,
    deleteExpense
}