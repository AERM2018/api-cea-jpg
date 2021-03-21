const { Router } = require('express');
const { check, param } = require('express-validator');
const { getAllStudents,createStudent,updateStudent,deleteStudent } = require('../controllers/studentController');
const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const studentsRouter = Router();

studentsRouter.get('/', [
    validateJWT
], getAllStudents);
studentsRouter.post('/',[
    check('id_student','La matricula del estudiante es obligatoria').notEmpty().isString(),
    //check('user_type','El tipo de usuario es obligatorio y tiene que tener como maximo 8 caracteres').not().isEmpty().isLength({max:8}),
    check('email','El email es obligatorio').notEmpty().isEmail(),
    check('name','El nombre del estudiante es obligatorio y debe de tener como maximo 35 caracteres').not().isEmpty().isLength({max:35}),
    check('surname','Los apellidos son obligatorios y debe de tener como maximo 45 caracteres').not().isEmpty().isLength({max:45}),
    check('group_chief','El campo de jefe de grupo se tiene que llenar').notEmpty().isInt(),
    check('curp','El CURP es obligatorio y tiene que tener como maximo 18 caracteres').not().isEmpty().isLength({max:18}),
    check('mobile_number','El numero de telefono es obligatorio y tienen que ser 10 digitos').not().isEmpty().isLength({max:10}),
    check('status','El estatus del alumno es obligatorio').isInt().exists({checkNull:true}),
    check('mobile_back_number','El numero de telefono es obligatorio y tiene que tener como maximo 10 caracteres').not().isEmpty().isLength({max:10}),
    check('address','El domicilio es obligatorio y tiene que tener 50 caracteres como maximo').not().isEmpty().isLength({max:50}),
    check('start_date','La fecha de inicio es obligatoria').notEmpty().isDate(),
    check('end_date','La fecha de fin es obligatoria').notEmpty().isDate(),
    check('complete_documents','Falta el campo de los documentos del alumno').notEmpty().isInt(),
    check('id_group','Falta el campo del id del alumno').isInt().exists({checkNull:true}),
    validateFields,
    validateJWT

], createStudent);
studentsRouter.put('/:id',[
    param('id','El id es obligatorio y tiene que ser la matricula de un alumno').notEmpty().isString(),
    check('name','El nombre del estudiante es obligatorio y debe de tener como maximo 35 caracteres').not().isEmpty().isLength({max:35}),
    check('surname','Los apellidos son obligatorios y debe de tener como maximo 45 caracteres').not().isEmpty().isLength({max:45}),
    check('group_chief','El campo de jefe de grupo se tiene que llenar').notEmpty().isString(),
    check('curp','El CURP es obligatorio y tiene que tener como maximo 18 caracteres').not().isEmpty().isLength({max:18}),
    check('mobile_number','El numero de telefono es obligatorio y tienen que ser 10 digitos').not().isEmpty().isLength({max:10}),
    check('status','El estatus del alumno es obligatorio').isInt().exists({checkNull:true}),
    check('mobile_back_number','El numero de telefono es obligatorio y tiene que tener como maximo 10 caracteres').not().isEmpty().isLength({max:10}),
    check('address','El domicilio es obligatorio y tiene que tener 50 caracteres como maximo').not().isEmpty().isLength({max:50}),
    check('start_date','La fecha de inicio es obligatoria').notEmpty().isDate(),
    check('end_date','La fecha de fin es obligatoria').notEmpty().isDate(),
    check('complete_documents','Falta el campo de los documentos del alumno').isInt().exists({checkNull:true}),
    validateFields,
    validateJWT

], updateStudent);

studentsRouter.delete('/:id',[
    param('id','El id es obligatorio y tiene que ser la matricula de un alumno').notEmpty().isString(),
    validateFields,
    validateJWT
], deleteStudent);

module.exports = studentsRouter;