const { Router } = require('express');
const { check, param } = require('express-validator');
const { getAllGraduation_Sections, createGraduation_Sections, updateGraduation_Sections, deleteGraduation_Sections} = require('../controllers/graduation_section');
const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const Extracurricularcourse_ass_Router = Router();

Extracurricularcourse_ass_Router.get('/',[
    validateJWT
], getAllExtracurricularcourse_ass);

Extracurricularcourse_ass_Router.post('/', [
    check('id_ext_cou','id_ext_cou llave foránea de tipo integer obligatoria').not().isEmpty().isInt(),
    check('id_assistance','id_assistance llave foránea de tipo integer obligatoria').isInt().not().isEmpty(),
    check('id_student','id_student llave foránea de tipo string con máximo 15 carácteres, obligatoria').isString().not().isEmpty().isLength( { max: 15 } ),
    validateFields,
    validateJWT
],createExtracurricularcourse_ass);

Extracurricularcourse_ass_Router.put('/:id',[
    param('id_extracurricularcourses_ass','id_extracurricularcourses_ass es llave primaria de tipo integer').not().isEmpty().isInt(),
    check('id_ext_cou','id_ext_cou llave foránea de tipo integer obligatoria').not().isEmpty().isInt(),
    check('id_assistance','id_assistance llave foránea de tipo integer obligatoria').isInt().not().isEmpty(),
    check('id_student','id_student llave foránea de tipo string con máximo 15 carácteres, obligatoria').isString().not().isEmpty().isLength( { max: 15 } ),
    validateFields,
    validateJWT
], updateExtracurricularcourse_ass);

Extracurricularcourse_ass_Router.delete('/:id',[
    param('id_extracurricularcourses_ass','id_extracurricularcourses_ass es llave primaria de tipo integer').isInt(),
    validateJWT
], deleteExtracurricularcourse_ass);


module.exports= Extracurricularcourse_ass_Router;