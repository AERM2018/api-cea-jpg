const { Router } = require('express');
const { check, param } = require('express-validator');
const { getAllGraduation_Sections, createGraduation_Sections, updateGraduation_Sections, deleteGraduation_Sections} = require('../controllers/graduation_section');
const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const stu_gracou_router = Router();

stu_gracou_router.get('/',[
    validateJWT
], getAllStuGracou);

stu_gracou_router.post('/', [
    check('id_student','id_student es llave foránea de tipo string, logitud máxima de 15, es obligatoria').isString().not().isEmpty().isLength( { max: 15 } ),
    check('id_graduation_course','id_graduation_course es llave foránea de tipo integer, es obligatoria').isInt().not().isEmpty(),
    check('id_tesine','id_tesine es llave foránea de tipo integer, es obligatoria').isInt().not().isEmpty(),
    validateFields,
    validateJWT
],createStuGracou);

stu_gracou_router.put('/:id',[
    param('id_stu_gracou','id_stu_gracou es llave primaria de tipo integer').not().isEmpty().isInt(),
    check('id_student','id_student es llave foránea de tipo string, logitud máxima de 15, es obligatoria').isString().not().isEmpty().isLength( { max: 15 } ),
    check('id_graduation_course','id_graduation_course es llave foránea de tipo integer, es obligatoria').isInt().not().isEmpty(),
    check('id_tesine','id_tesine es llave foránea de tipo integer, es obligatoria').isInt().not().isEmpty(),
    validateFields,
    validateJWT
], updateStuGracou);

stu_gracou_router.delete('/:id',[
    param('id_stu_gracou','id_stu_gracou es llave primaria de tipo integer').isInt(),
    validateJWT
], deleteStuGracou);


module.exports= stu_gracou_router;