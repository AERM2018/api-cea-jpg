const moment = require('moment');
const Expense = require('../models/expense');
const Emp_exp = require('../models/emp_exp');
const Expenses_types = require('../models/expenses_type');

const { db } = require('../database/connection');
const { expenses_type } = require("../types/dictionaries");

const getAllTheExpenses = async (req, res) => {
    try {
        let { fecha = moment().local().format("YYYY-MM-DD") } = req.query;
        let expenses

        if (fecha === 'all'){
            expenses = await Expense.findAll();
           
       }
       else{
           console.log(fecha)
           expenses = await Expense.findAll({
              where: {
                  date: fecha,
              }
          });

       }
       if (!expenses) {
           return res.status(400).json({
               ok: false,
               msg: "No existen gastos de la fecha " + fecha 
           })
       }
       const responseExpense = await Promise.all(expenses.map(async (expense) => {
            
        const { id_expense, amount } = expense


        const {expense_type, observation} = await Expenses_types.findOne({
            where: {id_expense}
        })

        
        console.log(expense_type)
        const {id_employee} = await Emp_exp.findOne({
            where: {id_expense}
        })

        return {
        id_expense,
        amount,
        expense_type: expenses_type[expense_type],
        observation,
        id_employee
            
        }
    }))

    return res.status(201).json({
        ok: true,
        data: responseExpense
    })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador"
        })
    }
}

const createExpense = async (req, res) => {

    const { id_employee } = req
    const { amount, expense_type, observation,
        date = moment().local().format("YYYY-MM-DD") } = req.body
    let id_expense
  
    try {
        // Creando un gasto y obteniendo su id
        const expense = new Expense({ amount, date });
        const newExpense = await expense.save();
        const expenseJson = newExpense.toJSON(); 
        id_expense = expenseJson['id_expense'];

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
    const { amount, observation, expense_type } = req.body;
    try {
        const expense = await Expense.findByPk(id);
        if (!expense) {
            return res.status(404).json({
                ok: false,
                msg: "No existe un gasto con el id " + id,
            });
        }
        await expense.update({ amount });

        const expensesTypes = await Expense.findByPk(id);
        expensesTypes.update({expense_type, observation})

        
        return res.status(200).json({
            ok: true,
            msg: `El gasto se actualizo correctamente`
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador"
        })
    }
}

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
            where: {id_expense: id}
        })
        await emp_exp.destroy();

        const expense_types = await Expenses_types.findOne({
            where: {id_expense: id}

        })

        await expense_types.destroy();


        await expense.destroy();

        return res.status(200).json({
            ok: true,
            msg: "El gasto se elimino correctamente",
            
        })




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