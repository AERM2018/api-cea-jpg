const { Router } = require('express');
const { check } = require('express-validator');
const { createRequest } = require('../controllers/requestController');
const { checkDepartmentExistence, checkStudentExistence } = require('../middlewares/dbValidations');
const { getIdStudent } = require('../middlewares/getIds');
const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const requestRouter = Router();

requestRouter.post('/',[
    validateJWT,
    check('matricula','La matricula del estudiante es obligatoria').isString().notEmpty().custom(checkStudentExistence),
    check('id_department','El id del department es obligatorio').isInt().exists({ checkNull : true}).custom(checkDepartmentExistence),
    check('document_type','Tipo de documento es obligatorio').exists({ checkNull : true}).isInt().if( (document_type) => document_type >= 0 && document_type <= 10),
    validateFields,
    getIdStudent
], createRequest)

module.exports = requestRouter