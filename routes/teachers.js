const { Router } = require('express');
const { check, param } = require('express-validator');
const { getAllTeachers,createTeacher,updateTeacher,deleteTeacher, getAllCoursesTeacherGiven} = require('../controllers/teacherController');
const { checkTeacherExistence } = require('../middlewares/dbValidations');
const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const teachersRouter = Router();

teachersRouter.get('/',[
    validateJWT
 ], getAllTeachers);


teachersRouter.post('/',[
    // check('user_type','el tipo de usuario es obligatorio y tiene que tener como maximo 8 caracteres').not().isEmpty().isLength({max:8}),
    // check('id_user','').not().isEmpty().isLength({max:35}),
    check('name','El nombre del profesor es obligatorio y debe de tener como maximo 35 caracteres').not().isEmpty().isLength({max:35}),
    // check('email','El email es obligatorio').notEmpty().isEmail(),
    check('surname_f','El apellido paterno es obligatorio y debe de tener como maximo 45 caracteres').not().isEmpty().isLength({max:45}),
    check('surname_m','El apellido materno es obligatorio y debe de tener como maximo 45 caracteres').not().isEmpty().isLength({max:45}),
    check('rfc','El RFC es obligatorio y tiene que tener como maximo 13 caracteres').not().isEmpty().isLength({max:13}),
    check('mobile_number','El numero de telefono es obligatorio y tienen que ser 10 digitos').not().isEmpty().isLength({max:10}),
    // check('courses','El campo courses es obligatorio').isInt().exists({checkNull:true}),
    // check('active','el campo activo es obligatorio').isInt().exists({checkNull:true}),
    // check('id_courses', 'Los ids de los cursos son obligatoris y deben de estar contenidos en un array').isArray(),
    validateFields,
    validateJWT

], createTeacher);


teachersRouter.put('/:id',[
    param('id','El id del maestro tiene que ser una cadena de texto y es obligatoria ').isString().notEmpty(),
    check('name','El nombre del profesor es obligatorio y debe de tener como maximo 35 caracteres').not().isEmpty().isLength({max:35}),
    check('surname_f','El apellido paterno es obligatorio y debe de tener como maximo 45 caracteres').not().isEmpty().isLength({max:45}),
    check('surname_m','El apellido materno es obligatorio y debe de tener como maximo 45 caracteres').not().isEmpty().isLength({max:45}),
    check('rfc','El RFC es obligatorio y tiene que tener como maximo 13 caracteres').not().isEmpty().isLength({max:13}),
    check('mobile_number','El numero de telefono es obligatorio y tienen que ser 10 digitos').not().isEmpty().isLength({max:10}),
    // check('courses','El campo curso son obligatorios').isInt().exists({checkNull:true}),
    // check('active','El campo activo es obligatorio').isInt().exists({checkNull:true}),
    validateFields,
    validateJWT

], updateTeacher);

teachersRouter.delete('/:id',[
    param('id','el id del maestro tiene que ser una cadena de texto y es obligatorio').isString().notEmpty(),
    validateFields,
    validateJWT
], deleteTeacher);

teachersRouter.get('/:id_teacher/courses',[
    check('id_teacher','El id del maestro tiene que ser una cadena de texto y es obligatorio').isString().notEmpty(),
    checkTeacherExistence,
    validateFields,
    validateJWT
], getAllCoursesTeacherGiven)

module.exports = teachersRouter;