const { Router } = require('express');
const { check } = require('express-validator');
const { getAllGradesByCourse, uploadGrades, updateGrades, deleteGradeByStudentId } = require('../controllers/gradesController');
const { validateFields } = require('../middlewares/validateFields');

const gradesRouter = Router();

gradesRouter.get( '/:id_course', [
    check('id_course','El id del curso es un numero entero y es obligatorio').isNumeric().notEmpty(),
    check('id_group',"El id del grupo es un numero entero y es obligatorio").isNumeric().notEmpty(),
    validateFields
] ,getAllGradesByCourse);

gradesRouter.post('/:id_course', [
    check('id_course','El id del curso es un numero entero y es obligatorio').isNumeric().notEmpty(),
    check('id_group',"El id del grupo es obligatorio").isNumeric().notEmpty(),
    check('students',"Las calificaciones de los estudiantes deben estar contenidas en un arreglo").isArray({ min:1 }),
    validateFields
], uploadGrades);

gradesRouter.put( '/:id_course', [
    check('id_course','El id del curso es un numero entero y es obligatorio').isNumeric().notEmpty(),
    check('id_group',"El id del grupo es obligatorio").notEmpty(),
    check('students',"Las calificaciones de los estudiantes deben estar contenidas en un arreglo").isArray({ min:1 }),
    validateFields
], updateGrades);

gradesRouter.delete( '/:id_course', [
    check('id_course','El id del curso es un numero entero y es obligatorio').isNumeric().notEmpty(),
    check('id_student',"El id del estudiante es obligatorio").notEmpty( ),
    validateFields
], deleteGradeByStudentId)




module.exports = gradesRouter;
// DEDG202103001