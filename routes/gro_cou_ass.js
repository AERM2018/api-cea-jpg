const { Router } = require('express');
const { check, param } = require('express-validator');
const { getAllGraduation_Sections, createGraduation_Sections, updateGraduation_Sections, deleteGraduation_Sections} = require('../controllers/graduation_section');
const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const Gro_cou_ass_Router = Router();

Gro_cou_ass_Router.get('/',[
    validateJWT
], getAllGro_cou_ass);

Gro_cou_ass_Router.post('/', [
    check('id_gro_cou','id_gro_cou es llave foránea de tipo integer, es obligatoria').not().isEmpty().isInt(),
    check('id_assistance','id_assistance es llave foránea de tipo integer, es obligatoria').isInt().not().isEmpty(),
    check('id_student','id_student es llave foránea de tipo string de 15 carácteres, es obligatoria').isString().not().isEmpty().isLength( { max: 15 } ),
    validateFields,
    validateJWT
],createGro_cou_ass);

Gro_cou_ass_Router.put('/:id',[
    param('id_gro_cou_ass','id_gro_cou_ass es llave primaria de tipo integer').not().isEmpty().isInt(),
    check('id_gro_cou','id_gro_cou es llave foránea de tipo integer, es obligatoria').not().isEmpty().isInt(),
    check('id_assistance','id_assistance es llave foránea de tipo integer, es obligatoria').isInt().not().isEmpty(),
    check('id_student','id_student es llave foránea de tipo string de 15 carácteres, es obligatoria').isString().not().isEmpty().isLength( { max: 15 } ),
    validateFields,
    validateJWT
], updateGro_cou_ass);

Gro_cou_ass_Router.delete('/:id',[
    param('id_gro_cou_ass','id_gro_cou_ass es llave primaria de tipo integer').isInt(),
    validateJWT
], deleteGro_cou_ass);


module.exports= Gro_cou_ass_Router;