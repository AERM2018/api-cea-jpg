const { Router } = require('express');
const { check, param } = require('express-validator');
const { getAllGraduationCourses, createGraduationCourses, updateGraduationCourses, deleteGraduationCourses, getStudentsFromGradCourse} = require('../controllers/graduation_coursesController');
const { checkGraduationCourseExistence, checkTeacherExistence } = require('../middlewares/dbValidations');
const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const Graduation_courses_Router = Router();

Graduation_courses_Router.get('/',[
    validateJWT
], getAllGraduationCourses);

Graduation_courses_Router.post('/', [
    check('course_grad_name','El nombre del curso de graduación es obligatorio').isString().not().isEmpty().isLength( { max: 25 } ),
    check('id_teacher','El id del maestro es obligatorio').isString().notEmpty().isLength({ max : 15 }),
    check('start_date','start_date es campo de tipo DATE con fromato YYYY-MM-DD, es obligatorio').isDate().not().isEmpty(),
    check('end_date','end_date es campo de tipo DATE con fromato YYYY-MM-DD, es obligatorio').isDate().not().isEmpty(),
    checkTeacherExistence,
    validateFields,
    validateJWT
],createGraduationCourses);

Graduation_courses_Router.put('/:id',[
    param('id','id_graduation_courses es llave primaria de tipo integer').not().isEmpty().isInt(),
    check('course_grad_name','course_grad_name es campo tipo string de 25 carácteres, es obligatorio').isString().not().isEmpty().isLength( { max: 25 } ),
    check('start_date','start_date es campo de tipo DATE con fromato YYYY-MM-DD, es obligatorio').isDate().not().isEmpty(),
    check('end_date','end_date es campo de tipo DATE con fromato YYYY-MM-DD, es obligatorio').isDate().not().isEmpty(),
    validateFields,
    validateJWT
], updateGraduationCourses);

Graduation_courses_Router.delete('/:id',[
    param('id_graduation_courses','id_graduation_courses es llave primaria de tipo integer').isInt(),
    validateJWT
], deleteGraduationCourses);

Graduation_courses_Router.get('/:id_graduation_course/students',[
    param('id_graduation_course','El id del curso de graduación es numero y es obligatorio.').isInt().notEmpty(),
    validateFields,
    checkGraduationCourseExistence,
    validateJWT
],getStudentsFromGradCourse)

module.exports= Graduation_courses_Router;