const { Router } = require('express');
const { check, param } = require('express-validator');
const { createDocument, getDocuments, deleteDocument, getDocsTypesAvailableToStudent} = require('../controllers/documentsController');
const { checkStudentExistence, isValidDocumentType, checkDocumentExistance } = require('../middlewares/dbValidations');
const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const documentsRouter = Router();

// documentsRouter.get('/',[
//     validateJWT
// ], getDocuments)

documentsRouter.get( '/students/:matricula/check', [
    checkStudentExistence,
    validateFields,
    validateJWT
] ,getDocsTypesAvailableToStudent);
 
documentsRouter.post('/:document_type/students/:matricula',[
    check('document_type','El tipo de documento es obligatorio y es un numero entero').isInt().notEmpty().custom(isValidDocumentType),
    check('matricula','La matricula del estudiante es obligatoria').notEmpty(),
    validateFields,
    checkStudentExistence,
    validateJWT
],createDocument)

documentsRouter.delete('/:id_document',[
    check('id_document','El id del documento es numero entero y es obligatorio.'),
    validateFields,
    checkDocumentExistance,
    validateJWT
],deleteDocument);
module.exports = documentsRouter;