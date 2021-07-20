const { Router } = require('express');
const { check, param } = require('express-validator');
const { getAllGraduation_Sections, createGraduation_Sections, updateGraduation_Sections, deleteGraduation_Sections} = require('../controllers/graduation_section');
const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const Gra_cou_tea_Router = Router();

Gra_cou_tea_Router.get('/',[
    validateJWT
], getAllGraduation_Sections);

Gra_cou_tea_Router.post('/', [
    // check('id_card','').not.isEmpty.isLength( { max:  } ),
   
    // check('id_graduation_section','').not().isEmpty().isString().isLength( { max: 16 } ),
    check('id_teacher','id_teacher es llave foránea de tipo string máximo de 30 y es campo obligatorio').not().isEmpty().isString().isLength( { max:30  } ),
    check('start_date','start_date con formato YYYY-MM-DD, campo obligatorio').isDate().not().isEmpty(),
    check('end_date','end_date con formato YYYY-MM-DD, campo obligatorio').isDate().not().isEmpty(),
    check('in_progress','in_progress tipo tinyint máximo de 1 y campo obligatorio').not().isEmpty().isLength( { max:1  } ),
    validateFields,
    validateJWT
],createGraduation_Sections);

Gra_cou_tea_Router.put('/:id',[
    param('id_graduation_section','Lave primaria de tipo integer').not().isEmpty().isInt(),
    check('id_teacher','id_teacher es llave foránea de tipo string máximo de 30 y es campo obligatorio').not().isEmpty().isString().isLength( { max:30  } ),
    check('start_date','start_date con formato YYYY-MM-DD, campo obligatorio').isDate().not().isEmpty(),
    check('end_date','end_date con formato YYYY-MM-DD, campo obligatorio').isDate().not().isEmpty(),
    check('in_progress','in_progress tipo tinyint máximo de 1 y campo obligatorio').not().isEmpty().isLength( { max:1  } ),
    validateFields,
    validateJWT
], updateGraduation_Sections);

Gra_cou_tea_Router.delete('/:id',[
    param('id_graduation_section', 'El id_graduation_section es obligatorio y debe ser integer').isInt(),
    validateJWT
], deleteGraduation_Sections);


module.exports= Gra_cou_tea_Router;