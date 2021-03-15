const { Router } = require('express');
const { check } = require('express-validator');
const { getAllGradesByCourse, uploadGrades, updateGrades, deleteGradeByStudentId } = require('../controllers/gradesController');
const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const gradesRouter = Router();

gradesRouter.get( '/:id_course', [
    check('id_course','El id del curso es un numero entero y es obligatorio').isNumeric().exists({checkNull:true}),
    check('id_group',"El id del grupo es un numero entero y es obligatorio").isNumeric().exists({checkNull:true}),
    validateFields,
    validateJWT
] ,getAllGradesByCourse);

gradesRouter.post('/:id_course', [
    check('id_course','El id del curso es un numero entero y es obligatorio').isNumeric().exists({checkNull:true}),
    check('id_group',"El id del grupo es obligatorio").isNumeric().exists({checkNull:true}),
    check('students',"Las calificaciones de los estudiantes deben estar contenidas en un arreglo").isArray({ min:1 }),
    validateFields,
    validateJWT
], uploadGrades);

gradesRouter.put( '/:id_course', [
    check('id_course','El id del curso es un numero entero y es obligatorio').isNumeric().exists({checkNull:true}),
    check('id_group',"El id del grupo es obligatorio").isNumeric().exists({checkNull:true}),
    check('students',"Las calificaciones de los estudiantes deben estar contenidas en un arreglo").isArray({ min:1 }),
    validateFields,
    validateJWT
], updateGrades);

gradesRouter.delete( '/:id_course', [
    check('id_course','El id del curso es un numero entero y es obligatorio').isNumeric().exists({checkNull:true}),
    check('id_student',"El id del estudiante es obligatorio y debe tener como máximo 15 caracteres").isString().notEmpty().isLength( { max : 15} ),
    validateFields,
    validateJWT
], deleteGradeByStudentId)




module.exports = gradesRouter;
// DEDG202103001