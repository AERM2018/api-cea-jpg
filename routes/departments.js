const { Router } = require('express');
const { check, param } = require('express-validator');
const {getAllDepartments,createDepartment,deleteDepartament,updateDepartament} = require('../controllers/departmentController');
const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const departmentsRouter = Router();

departmentsRouter.get('/', [
    validateJWT
], getAllDepartments);

departmentsRouter.post( '/',[
    check('department_name','el nombre del deparmento es obligatorio').notEmpty().isString(),
    validateFields,
    validateJWT

], createDepartment);

departmentsRouter.put( '/:id',[
    param('id','el id del departamento es obligatorio y debe de ser un numero entero').isNumeric(),
    check('department_name','el nombre del departamento es obligatorio' ).notEmpty().isString(),
    validateFields,
    validateJWT
],updateDepartament);

departmentsRouter.delete( '/:id',[
    param('id','el id del deparmento ties obligatorio y debe deer un numero entero').isNumeric(),
    validateFields,
    validateJWT
], deleteDepartament);

module.exports = departmentsRouter;