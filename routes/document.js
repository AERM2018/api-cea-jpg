const { Router } = require('express');
const { check, param } = require('express-validator');
const { getInfoDocument, createDocument, getDocuments, deleteDocument} = require('../controllers/documentsController');
const { checkStudentExistence, isValidDocumentType, checkDocumentExistance } = require('../middlewares/dbValidations');
const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const documentsRouter = Router();

// documentsRouter.get('/',[
//     validateJWT
// ], getDocuments)

documentsRouter.post( '/info', [
    // check('id','El id de la peticion es obligatorio y debe de ser un numero entero').isNumeric(),
    check('document_type','El tipo de documento es obligatorio').isInt().custom(isValidDocumentType),
    check('matricula','La matricula del estudiante es obligatoria').notEmpty(),
    checkStudentExistence,
    validateFields,
    validateJWT
] ,getInfoDocument);
 
documentsRouter.get('/',[
    // check('document_type','El tipo de documento es obligatorio y es un numero entero').isInt().notEmpty().custom(isValidDocumentType),
    // check('matricula','La matricula del estudiante es obligatoria').notEmpty(),
    // validateFields,
    // checkStudentExistence,
    // validateJWT
],createDocument)

documentsRouter.delete('/:id_document',[
    check('id_document','El id del documento es numero entero y es obligatorio.'),
    validateFields,
    checkDocumentExistance,
    validateJWT
],deleteDocument);
module.exports = documentsRouter;