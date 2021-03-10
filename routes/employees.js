const { Router } = require('express');
const { check, param } = require('express-validator');
const { getAllEmployees, createEmployee, updateEmployee, deleteEmployee } = require('../controllers/employeesController');
const { validateFields } = require('../middlewares/validateFields');

const employeesRouter = Router();

employeesRouter.get('/', getAllEmployees);
employeesRouter.post('/',[
    check('user_type','el tipo de usuario es obligatorio').notEmpty().isString(),
    check('email','el email es obligatorio').notEmpty().isString(),
    check('name','el nombre del estudiante es obligatorio').notEmpty().isString(),
    check('surname','Los apellidos son obligatorios').notEmpty().isString(),
    check('rfc','el RFC es obligatorio').notEmpty().isString(),
    check('curp','el CURP es obligatorio').notEmpty().isString(),
    check('mobile_number','el numero de telefono es obligatorio').notEmpty().isInt(),
    check('active','al campo activo es obligatorio').notEmpty().isInt(),
    check('day', 'el dia es obligatorio').notEmpty().isInt(),
    check('start_hour', 'la hora de inicio es obligatoria').notEmpty(),
    check('finish_hour','la hora de fin es obligatoria').notEmpty(),
    validateFields

], createEmployee);
employeesRouter.put('/:id',[
    //ID CHECARSE
    param('id','el id del empleado es obligatorio').isInt(),
    check('name','el nombre del estudiante es obligatorio').notEmpty().isString(),
    check('surname','Los apellidos son obligatorios').notEmpty().isString(),
    check('rfc','el RFC es obligatorio').notEmpty().isString(),
    check('curp','el CURP es obligatorio').notEmpty().isString(),
    check('mobile_number','el numero de telefono es obligatorio').notEmpty().isInt(),
    check('active','al campo activo es obligatorio').notEmpty().isInt(),
    validateFields

], updateEmployee);
employeesRouter.delete('/:id', [
    //SAME 
    param('id','el id del empleado es obligatorio').isInt(),
    validateFields

],deleteEmployee);

module.exports = employeesRouter;