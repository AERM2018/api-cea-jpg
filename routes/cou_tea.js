const { Router } = require('express');
const { check, param } = require('express-validator');
const { getAllGraduation_Sections, createGraduation_Sections, updateGraduation_Sections, deleteGraduation_Sections} = require('../controllers/graduation_section');
const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const Cou_tea_Router = Router();

Cou_tea_Router.get('/',[
    validateJWT
], getAllCou_tea);

Cou_tea_Router.post('/', [
    check('id_course','id_course es llave foránea de tipo integer obligatorio').not().isEmpty().isInt(),
    check('id_teacher','id_teacher es llave foránea de tipo integer obligatorio').isDate().not().isEmpty(),
    check('status','status campo de tipo bool obligatorio').isBoolean().not().isEmpty(),
    check('start_date','start_date es campo obligatorio de tipo date con formato YYYY-MM-DD').isDate().not().isEmpty(),
    check('end_date','end_date es campo de tipo date con formato YYYY-MM-DD').isDate(),
    validateFields,
    validateJWT
],createCou_tea);

Cou_tea_Router.put('/:id',[
    param('id_sub_tea','Llave primaria de tipo integer, es auto incremental').not().isEmpty().isInt(),
    check('id_course','id_course es llave foránea de tipo integer obligatorio').not().isEmpty().isInt(),
    check('id_teacher','id_teacher es llave foránea de tipo integer obligatorio').isDate().not().isEmpty(),
    check('status','status campo de tipo bool obligatorio').isBoolean().not().isEmpty(),
    check('start_date','start_date es campo obligatorio de tipo date con formato YYYY-MM-DD').isDate().not().isEmpty(),
    check('end_date','end_date es campo de tipo date con formato YYYY-MM-DD').isDate(),
    validateFields,
    validateJWT
], updateCou_tea);

Cou_tea_Router.delete('/:id',[
    param('id_sub_tea','Llave primaria de tipo integer, es auto incremental').isInt(),
    validateJWT
], deleteCou_tea);


module.exports= Cou_tea_Router;