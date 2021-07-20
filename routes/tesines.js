const { Router } = require('express');
const { check, param } = require('express-validator');
const { getAllGraduation_Sections, createGraduation_Sections, updateGraduation_Sections, deleteGraduation_Sections} = require('../controllers/graduation_section');
const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const Tesine_Router = Router();

Tesine_Router.get('/',[
    validateJWT
], getAllTesine);

Tesine_Router.post('/', [
    check('grade','grade es un campo obligatorio tipo float con un máximo de 4 carácteres').not().isEmpty().isInt().isLength( { max:4  } ),
    check('id_teacher','id_teacher es llave foránea, campo obligatorio de tipo string con máximo 30 carácteres').isString().not().isEmpty().isLength( { max: 30 } ),
    check('delivery_date','delivery_date es un campo obligatorio de tipo date con formato YYYY-MM-DD').isDate().not().isEmpty(),
    check('observations','observations es un campo que pueder ser nulo con un máximo de 200 carácteres').isString().not().isEmpty().isLength( { max: 200 } ),
    check('accepted_date','accepted_date es un campo obligatorio de tipo date con formato YYYY-MM-DD').isDate().not().isEmpty(),
    validateFields,
    validateJWT
],createTesine);

Tesine_Router.put('/:id',[
    param('id_tesine','id_tesine es llave primaria de tipo integer').not().isEmpty().isInt(),
    check('grade','grade es un campo obligatorio tipo float con un máximo de 4 carácteres').not().isEmpty().isInt().isLength( { max:4  } ),
    check('id_teacher','id_teacher es llave foránea, campo obligatorio de tipo string con máximo 30 carácteres').isString().not().isEmpty().isLength( { max: 30 } ),
    check('delivery_date','delivery_date es un campo obligatorio de tipo date con formato YYYY-MM-DD').isDate().not().isEmpty(),
    check('observations','observations es un campo que pueder ser nulo con un máximo de 200 carácteres').isString().not().isEmpty().isLength( { max: 200 } ),
    check('accepted_date','accepted_date es un campo obligatorio de tipo date con formato YYYY-MM-DD').isDate().not().isEmpty(),
    validateFields,
    validateJWT
], updateTesine);

Tesine_Router.delete('/:id',[
    param('id_tesine','id_tesine es llave primaria de tipo integer').isInt(),
    validateJWT
], deleteTesine);


module.exports= Tesine_Router;