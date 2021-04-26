const { Router } = require('express');
const { check, param } = require('express-validator');
const { getAllEmployees, createEmployee, updateEmployee, deleteEmployee } = require('../controllers/employeesController');
const { checkCampusExistence } = require('../middlewares/dbValidations');
const { isValidSchedule } = require('../middlewares/schedule');
const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const employeesRouter = Router();

employeesRouter.get('/',[ 
    validateJWT
], getAllEmployees);
employeesRouter.post('/',[
    // check('email','El email es obligatorio').notEmpty().isEmail(),
    check('name','El nombre del empleado es obligatorio y debe de tener como maximo 35 caracteres').not().isEmpty().isLength({max:35}),
    check('surname_f','El apellido paterno es obligatorio y debe de tener como maximo 45 caracteres').not().isEmpty().isLength({max:45}),
    check('surname_m','El apellido materno es obligatorio y debe de tener como maximo 45 caracteres').not().isEmpty().isLength({max:45}),
    check('rfc','El RFC es obligatorio y tiene que tener como maximo 13 caracteres').not().isEmpty().isLength({max:13}),
    check('curp','El CURP es obligatorio y tiene que tener como maximo 18 caracteres').not().isEmpty().isLength({max:18}),
    check('mobile_number','El numero de telefono es obligatorio y tienen que ser 10 digitos').not().isEmpty().isLength({max:10}),
    // check('active','al campo activo es obligatorio').isInt().exists({checkNull:true}),
    check('id_department','El id del departamento es obligatorio').isNumeric().exists({ checkNull : true}),
    check('id_campus','El id del campus es obligatorio').isNumeric().exists({ checkNull : true}).custom(checkCampusExistence),
    check('salary','El salario del empleado es obligatorio y debe ser un flotante').isFloat().exists({ checkNull : true}),
    // Checar como guardar los horarios
    check('time_tables','Es obligatorio seleccionar por lo menos un dia para el horario').isArray({ min : 1 }),
    // check('id_campus').custom(checkCampusExistence),
    validateFields,
    validateJWT,
    isValidSchedule
],createEmployee);
employeesRouter.put('/:id',[
    //ID CHECARSE
    param('id','El id del empleado es una cadena de texto y es obligatorio').isString().notEmpty(),
    check('name','El nombre del empleado es obligatorio y debe de tener como maximo 35 caracteres').not().isEmpty().isLength({max:35}),
    check('surname_f','El apellido paterno es obligatorio y debe de tener como maximo 45 caracteres').not().isEmpty().isLength({max:45}),
    check('surname_m','El apellido materno es obligatorio y debe de tener como maximo 45 caracteres').not().isEmpty().isLength({max:45}),
    check('rfc','El RFC es obligatorio y tiene que tener como maximo 13 caracteres').not().isEmpty().isLength({max:13}),
    check('curp','El CURP es obligatorio y tiene que tener como maximo 18 caracteres').not().isEmpty().isLength({max:18}),
    check('mobile_number','El numero de telefono es obligatorio y tienen que ser 10 digitos').not().isEmpty().isLength({max:10}),
    check('active','El campo activo es obligatorio').isInt().exists({checkNull:true}),
    check('salary','El salario del empleado es obligatorio y debe ser un flotante').isFloat().exists({ checkNull : true}),
    // poner id department
    validateFields,
   validateJWT

], updateEmployee);
employeesRouter.delete('/:id', [
    //SAME 
    param('id','El id del empleado es una cadena de texto y es obligatorio').isString().notEmpty(),
    validateFields,
    validateJWT

],deleteEmployee);

module.exports = employeesRouter;