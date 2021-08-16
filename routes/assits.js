const { Router } = require('express');
const { check, param } = require('express-validator');
const { takeCourseAssistance, deleteAssistence, updateAssitence, getAllAssistance,takeExtracurCourAssistance, takeGraSecAssistance,getAllAssistanceByStudent, getExtrCourAssistance, getGraSecAssistance, getCourseAssistance } = require('../controllers/assitsController');
const { checkExtraCurCourExistence, checkGraSecExistence, checkCourseExistence, checkAssitExistence, checkGroupCourseExistence } = require('../middlewares/dbValidations');
const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const assitsRouter = Router()

// READ

assitsRouter.get('/students/:id_student',[
    validateJWT
],getAllAssistanceByStudent)


assitsRouter.get( '/', [
    validateFields,
    validateJWT
] ,getAllAssistance);

assitsRouter.get('/regular/:id_gro_cou',[
    check('id_gro_cou','El id del curso grupo es numero y es obligatorio.').isNumeric().notEmpty(),
    validateFields,
    checkGroupCourseExistence,
    validateJWT
],getCourseAssistance)

assitsRouter.get('/extra/:id_ext_cou',[
    check('id_ext_cou','El id del curso extracurricular es numero y es obligatorio.').isNumeric().notEmpty(),
    validateFields,
    checkExtraCurCourExistence,
    validateJWT
],getExtrCourAssistance)

assitsRouter.get('/grasec/:id_graduation_section',[
    check('id_graduation_section','El id de la sección de graduación es numero y es obligatorio.').isNumeric().notEmpty(),
    validateFields,
    checkGraSecExistence,
    validateJWT
],getGraSecAssistance)

// assitsRouter.get( '/: id_extracurricularcourses_ass', [
//     check('id_extracurricularcourses_ass','El id  es un número entero y es obligatorio').isNumeric().exists({checkNull:true}),
//     // check('id_student',"El id del estudiante es un número entero y es obligatorio").isNumeric().exists({checkNull:true}),
//     // check('grade',"El campo grade es de tipo float de 4 y es obligatorio").isFloat(4).exists({checkNull:true}),
//     validateFields,
//     validateJWT
// ] ,getAllExtracurCourAssistance);

// assitsRouter.get( '/: id_gra_sec_ass', [
//     check('id_gra_sec_ass','El id es un número entero y es obligatorio').isNumeric().exists({checkNull:true}),
//     check('id_student',"El id del estudiante es un número entero y es obligatorio").isNumeric().exists({checkNull:true}),
//     validateFields,
//     validateJWT
// ] ,getAllGraSecAssistance);

// // CREATES

assitsRouter.post('/courses/:id_course',[
    check('id_course','id_course de tipo integer, campo obligatorio').isInt().notEmpty(),
    checkCourseExistence,
    validateFields,
    validateJWT
] ,takeCourseAssistance);

assitsRouter.post('/extra/:id_ext_cou',[
    check('id_ext_cou','id_ext_cou de tipo integer, campo obligatorio').isInt().notEmpty(),
    checkExtraCurCourExistence,
    validateFields,
    validateJWT
] ,takeExtracurCourAssistance);

assitsRouter.post('/grasec/:id_graduation_section',[
    check('id_graduation_section','id_graduation_section de tipo integer, campo obligatorio').isInt().notEmpty(),
    checkGraSecExistence,
    validateFields,
    validateJWT
] ,takeGraSecAssistance);

// // UPDATES

assitsRouter.put( '/:id_assistance', [
    param('id_assistance','Campo de tipo integer, obligatorio').not().isEmpty().isInt(),
    check('attended','Campo de tipo tinyint, obligatorio. 0=Falta, 1=Asistencia, 2=Falta justificada').isNumeric().notEmpty(),
    validateFields,
    validateJWT
], updateAssitence);

// DELETES

assitsRouter.delete( '/:id_assistance', [
    check('id_assistance','El id es un número entero y es obligatorio').isNumeric(),
    validateFields,
    checkAssitExistence,
    validateJWT
], deleteAssistence);

module.exports = assitsRouter;
