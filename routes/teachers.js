const { Router } = require('express');
const { check, param } = require('express-validator');
const { getAllTeachers,createTeacher,updateTeacher,deleteTeacher} = require('../controllers/teacherController');
const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const teachersRouter = Router();

teachersRouter.get('/',[
    validateJWT
 ], getAllTeachers);


teachersRouter.post('/',[
    check('user_type','El tipo de usuario es obligatorio').notEmpty().isString(),
    check('email','El email es obligatorio').notEmpty().isEmail(),
    check('name','El nombre del estudiante es obligatorio').notEmpty().isString(),
    check('surname','Los apellidos son obligatorios').notEmpty().isString(),
    check('rfc','El RFC es obligatorio').notEmpty().isString(),
    check('mobile_number','El numero de telefono es obligatorio').notEmpty().isString(),
    check('id_ext_cou','El id de curso extracurricular es obligatorio').isInt(),
    check('courses','El campo curso son obligatorios').isInt().exists({checkNull:true}),
    check('active','el campo activo es obligatorio').isInt().exists({checkNull:true}),
    check('id_courses', 'Los ids de los cursos son obligatoris y deben de estar contenidos en un array').notEmpty().isArray(),
    check('status','El estatus es obligatorio').notEmpty().isString(),
    check('start_date','La fecha de entrada es obligatoria').notEmpty().isDate(),
    check('end_date','La fecha de salida es obligatoria').notEmpty().isDate(),
    validateFields,
    validateJWT

], createTeacher);


teachersRouter.put('/:id',[
    param('id','el id del maestro tiene que ser una cadena de texto y es obligatoria ').isString().notEmpty(),
    check('name','El nombre del estudiante es obligatorio').notEmpty().isString(),
    check('surname','Los apellidos son obligatorios').notEmpty().isString(),
    check('rfc','El RFC es obligatorio').notEmpty().isString(),
    check('mobile_number','El numero de telefono es obligatorio').notEmpty().isString(),
    check('id_ext_cou','El id de curso extracurricular es obligatorio').isInt(),
    check('courses','El campo curso son obligatorios').isInt().exists({checkNull:true}),
    check('active','el campo activo es obligatorio').isInt().exists({checkNull:true}),
    // 
    
    validateFields,
    validateJWT

], updateTeacher);
teachersRouter.delete('/:id',[
    param('id','el id del maestro tiene que ser una cadena de texto y es obligatoria ').isString().notEmpty(),
    validateFields,
    validateJWT
], deleteTeacher);

module.exports = teachersRouter;