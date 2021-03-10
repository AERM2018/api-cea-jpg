const { Router } = require('express');
const { check, param } = require('express-validator');
const {getAllDepartments,createDepartment,deleteDepartament,updateDepartament} = require('../controllers/departmentController');
const { validateFields } = require('../middlewares/validateFields');

const departmentsRouter = Router();

departmentsRouter.get('/', getAllDepartments);

departmentsRouter.post( '/',[
    check('department_name','el nombre del deparmento es obligatorio').notEmpty(),
    validateFields

], createDepartment);

departmentsRouter.put( '/:id',[
    param('id','el id del departamento tiene que ser un numero').isNumeric(),
    check('department_name','el nombre del departamento es obligatorio' ).notEmpty(),
    validateFields
],updateDepartament);

departmentsRouter.delete( '/:id',[
    param('id','el id del deparmento tiene que ser un numero').isNumeric(),
    validateFields
], deleteDepartament);

module.exports = departmentsRouter;