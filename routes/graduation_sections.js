const { Router } = require('express');
const { check, param } = require('express-validator');
const { getAllGraduationSections,getGraduationSectionsById, createGraduationSections, updateGraduationSections, deleteGraduationSections} = require('../controllers/graduation_sectionController');
const { checkTeacherExistence, checkGraduationCourseExistence } = require('../middlewares/dbValidations');
const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const graduation_sections_router = Router();

graduation_sections_router.get('/',[
    validateJWT
], getAllGraduationSections);

graduation_sections_router.get('/:id', [
    param('id','Id de la sección del curso de graduación es obligatorio y número entero').notEmpty().isInt(),
    validateFields,
    validateJWT
],getGraduationSectionsById);

graduation_sections_router.post('/', [
    check('id_teacher','id_teacher es llave foránea de tipo string máximo de 30 y es campo obligatorio').not().isEmpty().isString().isLength( { max:30  } ),
    check('start_date','start_date con formato YYYY-MM-DD, campo obligatorio').isDate().not().isEmpty(),
    check('end_date','end_date con formato YYYY-MM-DD, campo obligatorio').isDate().not().isEmpty(),
    check('in_progress','in_progress es bool, campo obligatorio').not().isEmpty().isBoolean(),
    check('graduation_section_name','graduation_section_name es un campo de tipo string máximo de 30 y es campo obligatorio').not().isEmpty().isString().isLength( { max:30  } ),
    check('id_graduation_course','id_graduation_course es llave foránea de tipo integer y es campo obligatorio').not().isEmpty().isInt(),
    checkTeacherExistence,
    checkGraduationCourseExistence,
    validateFields,
    validateJWT
],createGraduationSections);


graduation_sections_router.put('/:id',[
    param('id','Lave primaria de tipo integer').not().isEmpty().isInt(),
    check('id_teacher','id_teacher es llave foránea de tipo string máximo de 30 y es campo obligatorio').not().isEmpty().isString().isLength( { max:30  } ),
    check('start_date','start_date con formato YYYY-MM-DD, campo obligatorio').isDate().not().isEmpty(),
    check('end_date','end_date con formato YYYY-MM-DD, campo obligatorio').isDate().not().isEmpty(),
    check('in_progress','in_progress es bool, campo obligatorio').not().isEmpty().isBoolean(),
    check('graduation_section_name','graduation_section_name es un campo de tipo string máximo de 30 y es campo obligatorio').not().isEmpty().isString().isLength( { max:30  } ),
    check('id_graduation_course','id_graduation_course es llave foránea de tipo integer y es campo obligatorio').not().isEmpty().isInt(),
    validateFields,
    validateJWT
], updateGraduationSections);

graduation_sections_router.delete('/:id',[
    param('id_graduation_section', 'El id_graduation_section es obligatorio y debe ser integer').isInt(),
    validateJWT
], deleteGraduationSections);


module.exports= graduation_sections_router;