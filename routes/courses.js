const { Router } = require('express');
const { check } = require('express-validator');
const { validateFields } = require('../middlewares/validateFields')

const { getAllCourses, createCourse, updateCourse, deleteCourse } = require('../controllers/coursesController');

const coursesRouter = Router();

coursesRouter.get( '/', getAllCourses);

coursesRouter.post('/', [
    check('id_major', 'El id de major es numero y es obligatorio').isNumeric(),
    check('course_name','El nombre del curso es obligatorio').not().isEmpty(),
    validateFields
] ,createCourse);

coursesRouter.put('/:id',[
    check('id_major', 'El id de major es numero y es obligatorio').isNumeric(),
    check('course_name','El nombre del curso es obligatorio').not().isEmpty(),
    validateFields
],
updateCourse);

coursesRouter.delete( '/:id', deleteCourse)


module.exports = coursesRouter;