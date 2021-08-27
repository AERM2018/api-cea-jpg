const { Router, request } = require('express');
const { check, param } = require('express-validator');
const { createRequest, getAllTheRequests, completeARequest , deleteRequest } = require('../controllers/requestController');
const { checkDepartmentExistence, checkStudentExistence } = require('../middlewares/dbValidations');
const { getIdStudent } = require('../middlewares/getIds');
const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const requestRouter = Router();
requestRouter.get('/',[
    validateJWT
], getAllTheRequests)

requestRouter.post('/',[
    validateJWT,
    check('matricula','La matricula del estudiante es obligatoria').isString().notEmpty(),
    check('id_department','El id del departmento es obligatorio').isInt().exists({ checkNull : true}),
    check('document_type','Tipo de documento es obligatorio').exists({ checkNull : true}).isInt().if( (document_type) => document_type >= 0 && document_type <= 10),
    validateFields,
    checkStudentExistence,
    checkDepartmentExistence,
], createRequest)

requestRouter.put('/:id',[
    param('id','El id de la solicitud es obligatorio y debe de ser un numero entero').isNumeric(),
    validateJWT,
    validateFields
], completeARequest)

requestRouter.delete('/:id', [
    param('id','El id de la solicitud es obligatorio y debe de ser un numero entero').isNumeric(),
    validateFields,
    validateJWT
], deleteRequest)


module.exports = requestRouter