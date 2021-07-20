const { Router } = require('express');
const { check, param } = require('express-validator');
const { getAllGraduation_Sections, createGraduation_Sections, updateGraduation_Sections, deleteGraduation_Sections} = require('../controllers/graduation_section');
const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const Stu_extracou_Router = Router();

Stu_extracou_Router.get('/',[
    validateJWT
], getAllStu_extracou);

Stu_extracou_Router.post('/', [
    check('id_student','id_student es llave foránea obligatoria, tipo string de 15').isString().not().isEmpty().isLength( { max:15  } ),
    check('id_ext_cou','id_ext_cou es llave foránea obligatoria, tipo integer').isInt().not().isEmpty(),
    check('grade','grade es campo obligatorio de tipo float con maximo de 4 carácteres').isFloat().not().isEmpty().isLength( { max:4  } ),
    validateFields,
    validateJWT
],createStu_extracou);

Stu_extracou_Router.put('/:id',[
    param('id_stu_extracou','id_stu_extracou es llave primaria de tipo integer').not().isEmpty().isInt(),
    check('id_student','id_student es llave foránea obligatoria, tipo string de 15').isString().not().isEmpty().isLength( { max:15  } ),
    check('id_ext_cou','id_ext_cou es llave foránea obligatoria, tipo integer').isInt().not().isEmpty(),
    check('grade','grade es campo obligatorio de tipo float con maximo de 4 carácteres').isFloat().not().isEmpty().isLength( { max:4  } ),
    validateFields,
    validateJWT
], updateStu_extracou);

Stu_extracou_Router.delete('/:id',[
    param('id_stu_extracou','id_stu_extracou es llave primaria de tipo integer').isInt(),
    validateJWT
], deleteStu_extracou);


module.exports= Stu_extracou_Router;