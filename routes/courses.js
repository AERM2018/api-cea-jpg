const { Router } = require('express');
const { check, param } = require('express-validator');
const { validateFields } = require('../middlewares/validateFields')

const { getAllCourses, createCourse, updateCourse, deleteCourse } = require('../controllers/coursesController');
const validateJWT = require('../middlewares/validar-jwt');

const coursesRouter = Router();

coursesRouter.get('/', [
    validateJWT
],getAllCourses);

coursesRouter.post('/', [
    check('id_major', 'El id de major es obligatorio y debe ser un numero entero').isNumeric().exists({checkNull:true}),
    check('course_name', 'El nombre del curso es obligatorio y debe tener como máximo 25 caracteres').not().isEmpty().isLength({ max : 25}),
    validateFields,
    validateJWT
], createCourse);

coursesRouter.put('/:id', [
    param('id', "El id del curso es obligatorio y debe de ser un numero").isNumeric(),
    check('id_major', 'El id de major es obligatorio y debe ser un numero entero').isNumeric().exists({checkNull:true}),
    check('course_name', 'El nombre del curso es obligatorio y debe tener como máximo 25 caracteres').not().isEmpty().isLength({ max : 25}),
    validateFields,
    validateJWT
],
    updateCourse);

coursesRouter.delete('/:id', [
    param('id', "El id del curso es obligatorio y debe de ser un numero").isNumeric(),
    validateJWT
], deleteCourse)


module.exports = coursesRouter;