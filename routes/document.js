const { Router } = require('express');
const { check, param } = require('express-validator');
const { getInfoDocument} = require('../controllers/documentsController');
const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const documentsRouter = Router();

documentsRouter.get( '/:id', [
    param('id','El id de la peticion es obligatorio y debe de ser un numero entero').isNumeric(),
    validateFields,
    validateJWT
] ,getInfoDocument);
 

module.exports = documentsRouter;