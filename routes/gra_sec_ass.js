const { Router } = require('express');
const { check, param } = require('express-validator');
const { getAllGraduation_Sections, createGraduation_Sections, updateGraduation_Sections, deleteGraduation_Sections} = require('../controllers/graduation_section');
const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const Gra_sec_ass_Router = Router();

Gra_sec_ass_Router.get('/',[
    validateJWT
], getAllGra_sec_ass);

Gra_sec_ass_Router.post('/', [
    check('id_graduation_section','id_graduation_section campo obligatorio de tipo integer').not().isEmpty().isInt(),
    check('id_assistance','id_assistance campo obligatorio de tipo integer').isInt().not().isEmpty(),
    check('id_student','id_student campo obligatorio de tipo string con un máximo de 15 carácteres').isString().not().isEmpty().isLength( { max: 15 } ),
    validateFields,
    validateJWT
],createGra_sec_ass);

Gra_sec_ass_Router.put('/:id',[
    param('id_gra_sec_ass','id_gra_sec_ass llave primaria de tipo integer').not().isEmpty().isInt(),
    check('id_graduation_section','id_graduation_section campo obligatorio de tipo integer').not().isEmpty().isInt(),
    check('id_assistance','id_assistance campo obligatorio de tipo integer').isInt().not().isEmpty(),
    check('id_student','id_student campo obligatorio de tipo string con un máximo de 15 carácteres').isString().not().isEmpty().isLength( { max: 15 } ),
    validateFields,
    validateJWT
], updateGra_sec_ass);

Gra_sec_ass_Router.delete('/:id',[
    param('id_gra_sec_ass','id_gra_sec_ass llave primaria de tipo integer').isInt(),
    validateJWT
], deleteGra_sec_ass);


module.exports= Gra_sec_ass_Router;