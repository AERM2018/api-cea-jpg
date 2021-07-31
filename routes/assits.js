const { Router } = require('express');
const { check, param } = require('express-validator');
const { takeCourseAssistance, deleteCourseAssistence, deleteExtracurCourAssistance, deleteGraSecAssistance, updateGraSecAssistance, updateExtracurCourAssistance, updateCourseAssitence, getAllCourseAssistance, getAllExtracurCourAssistance, getAllGraSecAssistance, takeExtracurCourAssistance, takeGraSecAssistance } = require('../controllers/assitsController');
const { checkExtraCurCourExistence, checkGraSecExistence, checkCourseExistence } = require('../middlewares/dbValidations');
const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const assitsRouter = Router()

// READ

// assitsRouter.get('/all',[
//     validateJWT
// ],getAll)


assitsRouter.get( '/', [
    validateFields,
    validateJWT
] ,getAllCourseAssistance);

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
    check('date_assistance','El id del curso es un numero entero y es obligatorio').isDate().notEmpty(),
    check('attended','Campo de tipo tinyint, obligatorio. 0=Falta, 1=Asistencia, 2=Falta justificada').isNumeric().notEmpty(),
    validateFields,
    validateJWT
], updateCourseAssitence);

// assitsRouter.put( 'regular/:id', [
//     param('','Llave ').not().isEmpty().isInt(),
//     // check('id_course','El id del curso es un numero entero y es obligatorio').isNumeric().exists({checkNull:true}),
//     // check('id_group',"El id del grupo es obligatorio").isNumeric().exists({checkNull:true}),
//     // check('students',"Las calificaciones de los estudiantes deben estar contenidas en un arreglo").isArray({ min:1 }),
//     check('grade', 'Calificación es de tipo float obligatoria').isFloat().notEmpty(),
//     validateFields,
//     validateJWT
// ], updateExtracurCourAssistance);

// assitsRouter.put( 'regular/:id', [
//     param('','Llave ').not().isEmpty().isInt(),
//     // check('id_course','El id del curso es un numero entero y es obligatorio').isNumeric().exists({checkNull:true}),
//     validateFields,
//     validateJWT
// ], updateGraSecAssistance);

// // DELETES
// // TODO:Pendientes...

assitsRouter.delete( '/:id_assistance', [
    check('id_assistance','El id es un número entero y es obligatorio').isNumeric(),
    validateFields,
    validateJWT
], deleteCourseAssistence);

// assitsRouter.delete( '/:id_course', [
//     check('id_course','El id del curso es un numero entero y es obligatorio').isNumeric().exists({checkNull:true}),
//     check('matricula',"El id del estudiante es obligatorio y debe tener como máximo 15 caracteres").isString().notEmpty().isLength( { max : 15} ),
//     validateFields,
//     validateJWT
// ], deleteExtracurCourAssistance);

// assitsRouter.delete( '/:id_course', [
//     check('id_course','El id del curso es un numero entero y es obligatorio').isNumeric().exists({checkNull:true}),
//     check('matricula',"El id del estudiante es obligatorio y debe tener como máximo 15 caracteres").isString().notEmpty().isLength( { max : 15} ),
//     validateFields,
//     validateJWT
// ], deleteGraSecAssistance);




module.exports = assitsRouter;
