const { Router } = require('express');
const { check, param } = require('express-validator');
const { getInfoDocument, createDocument, getDocuments} = require('../controllers/documentsController');
const { checkStudentExistence, isValidDocumentType } = require('../middlewares/dbValidations');
const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const documentsRouter = Router();

documentsRouter.post( '/info', [
    // check('id','El id de la peticion es obligatorio y debe de ser un numero entero').isNumeric(),
    check('document_type','El tipo de documento es obligatorio').isInt().custom(isValidDocumentType),
    check('matricula','La matricula del estudiante es obligatoria').notEmpty(),
    checkStudentExistence,
    validateFields,
    validateJWT
] ,getInfoDocument);
 
documentsRouter.post('/',[
    check('document_type','El tipo de documento es obligatorio y es un numero entero').isInt().notEmpty().custom(isValidDocumentType),
    check('matricula','La matricula del estudiante es obligatoria').notEmpty(),
    validateFields,
    checkStudentExistence,
    validateJWT
],createDocument)

documentsRouter.get('/',[
    validateJWT
], getDocuments)
module.exports = documentsRouter;