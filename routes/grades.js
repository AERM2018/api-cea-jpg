const { Router } = require('express');
const { check, param } = require('express-validator');
const { getAllGradesByCourse, uploadGrades, updateGrades, deleteGradeByStudentId, getAllGradesByStudent, getAllGradesByGroups, getAllGroupsGrade, getAllGradesByGroup, getAllGroupsGrades } = require('../controllers/gradesController');
const { checkStudentExistence, checkGroupExistence } = require('../middlewares/dbValidations');
const checkGrades = require('../middlewares/grades');
const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const gradesRouter = Router();

gradesRouter.get('/groups/',[
    validateJWT
], getAllGroupsGrades)

gradesRouter.get('/groups/:id_group',[
    check('id_group',"El id del grupo es obligatorio y debe ser un numero entero").isInt().notEmpty(),
    checkGroupExistence,
    validateJWT
], getAllGradesByGroup)

gradesRouter.get('/students/:matricula',[
    check('matricula',"La matricula del estudiante es obligatoria").notEmpty(),
    checkStudentExistence,
    validateJWT
], getAllGradesByStudent)

gradesRouter.get( '/:id_course', [
    check('id_course','El id del curso es un número entero y es obligatorio').isNumeric().exists({checkNull:true}),
    check('id_student',"El id del estudiante es un número entero y es obligatorio").isNumeric().exists({checkNull:true}),
    check('grade',"El campo grade es de tipo float de 4 y es obligatorio").isFloat(4).exists({checkNull:true}),
    validateFields,
    validateJWT
] ,getAllGradesByCourse);


gradesRouter.post('/:id_course', [
    check('id_course','El id del curso es un numero entero y es obligatorio').isNumeric().exists({checkNull:true}),
    check('id_group',"El id del grupo es obligatorio").isNumeric().exists({checkNull:true}),
    check('students',"Las calificaciones de los estudiantes deben estar contenidas en un arreglo").isArray({ min:1 }),
    validateFields,
    checkGrades,
    validateJWT
], uploadGrades);

gradesRouter.put( '/:id_course', [
    param('id_grade','Llave ').not().isEmpty().isInt(),
    check('id_course','El id del curso es un numero entero y es obligatorio').isNumeric().exists({checkNull:true}),
    check('id_group',"El id del grupo es obligatorio").isNumeric().exists({checkNull:true}),
    check('students',"Las calificaciones de los estudiantes deben estar contenidas en un arreglo").isArray({ min:1 }),
    validateFields,
    checkGrades,
    validateJWT
], updateGrades);

gradesRouter.delete( '/:id_course', [
    check('id_course','El id del curso es un numero entero y es obligatorio').isNumeric().exists({checkNull:true}),
    check('matricula',"El id del estudiante es obligatorio y debe tener como máximo 15 caracteres").isString().notEmpty().isLength( { max : 15} ),
    checkStudentExistence,
    validateFields,
    validateJWT
], deleteGradeByStudentId)




module.exports = gradesRouter;
// DEDG202103001