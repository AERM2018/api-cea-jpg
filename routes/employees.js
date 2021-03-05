const { Router } = require('express');
const { getAllEmployees, createEmployee, updateEmployee, deleteEmployee } = require('../controllers/employeesController');

const employeesRouter = Router();

employeesRouter.get('/', getAllEmployees);
employeesRouter.post('/', createEmployee);
employeesRouter.put('/:id', updateEmployee);
employeesRouter.delete('/:id', deleteEmployee);

module.exports = employeesRouter;