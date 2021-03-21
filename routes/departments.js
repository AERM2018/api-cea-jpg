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
    check('department_name','El nombre del deparmento es obligatorio y tiene que tener como maximo 22 caracteres ').not().isEmpty().isLength({max:22}),
    validateFields,
    validateJWT

], createDepartment);

departmentsRouter.put( '/:id',[
    param('id','El id del departamento es obligatorio y debe de ser un numero entero').isNumeric(),
    check('department_name','El nombre del deparmento es obligatorio y tiene que tener como maximo 22 caracteres ').not().isEmpty().isLength({max:22}),
    validateFields,
    validateJWT
],updateDepartament);

departmentsRouter.delete( '/:id',[
    param('id','El id del deparmento ties obligatorio y debe deer un numero entero').isNumeric(),
    validateFields,
    validateJWT
], deleteDepartament);

module.exports = departmentsRouter;