const { Router } = require('express');
const { check, param } = require('express-validator');
const { getAllGraduation_Sections, createGraduation_Sections, updateGraduation_Sections, deleteGraduation_Sections} = require('../controllers/graduation_section');
// modificar al momento de crear controller
const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const Gra_cou_tea_Router = Router();

Gra_cou_tea_Router.get('/',[
    validateJWT
], getAllGra_cou_tea);

Gra_cou_tea_Router.post('/', [
    check('id_graduation_course','id_graduation_course es llave foránea de tipo integer y es campo obligatorio').not().isEmpty().isInt(),
    check('id_teacher','id_teacher es llave foránea tipo string máximo de 30, campo obligatorio').isString().not().isEmpty().isLength( { max: 30 } ),
    validateFields,
    validateJWT
],createGra_cou_tea);

Gra_cou_tea_Router.put('/:id',[
    param('id_gra_cou_tea','Lave primaria de tipo integer').not().isEmpty().isInt(),
    check('id_graduation_course','id_graduation_course es llave foránea de tipo integer y es campo obligatorio').not().isEmpty().isInt(),
    check('id_teacher','id_teacher es llave foránea tipo string máximo de 30, campo obligatorio').isString().not().isEmpty().isLength( { max: 30 } ),
    validateFields,
    validateJWT
], updateGra_cou_tea);

Gra_cou_tea_Router.delete('/:id',[
    param('id_gra_cou_tea','Lave primaria de tipo integer').not().isEmpty().isInt(),
    validateJWT
], deleteGra_cou_tea);


module.exports= Gra_cou_tea_Router;