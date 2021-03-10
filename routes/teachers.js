const { Router } = require('express');
const { check, param } = require('express-validator');
const { getAllTeachers,createTeacher,updateTeacher,deleteTeacher} = require('../controllers/teacherController');
const { validateFields } = require('../middlewares/validateFields');

const teachersRouter = Router();

teachersRouter.get('/', getAllTeachers);


teachersRouter.post('/',[
    check('user_type','el tipo de usuario es obligatorio').notEmpty().isString(),
    check('email','el email es obligatorio').notEmpty().isString(),
    check('name','el nombre del estudiante es obligatorio').notEmpty().isString(),
    check('surname','Los apellidos son obligatorios').notEmpty().isString(),
    check('rfc','el RFC es obligatorio').notEmpty().isString(),
    check('mobile_number','el numero de telefono es obligatorio').notEmpty().isInt(),
    check('id_ext_cou','el id de cursos extras es obligatorio').notEmpty().isInt(),
    check('courses','cursos son obligatorios').notEmpty().isInt(),
    check('active','el campo activo es obligatorio').notEmpty().isInt(),
    check('id_courses', 'id courses es obligatorio y tiene que ser un array').notEmpty().isArray(),
    check('status','el estatus es obligatorio').notEmpty().isString(),
    check('start_date','la fecha de entrada es obligatoria').notEmpty().isDate(),
    check('end_date','la fecha de salida es obligatoria').notEmpty().isDate(),
    validateFields

], createTeacher);


teachersRouter.put('/:id',[
    param('id','el id tiene que ser un numero').isInt(),
    check('name','el nombre del estudiante es obligatorio').notEmpty().isString(),
    check('surname','Los apellidos son obligatorios').notEmpty().isString(),
    check('rfc','el RFC es obligatorio').notEmpty().isString(),
    check('mobile_number','el numero de telefono es obligatorio').notEmpty().isInt(),
    check('id_ext_cou','el id de cursos extras es obligatorio').notEmpty().isInt(),
    check('courses','cursos son obligatorios').notEmpty().isInt(),
    check('active','el campo activo es obligatorio').notEmpty().isInt(),
    validateFields

], updateTeacher);
teachersRouter.delete('/:id',[
    param('id','el id tiene que ser un numero').isInt(),
    validateFields
], deleteTeacher);

module.exports = teachersRouter;