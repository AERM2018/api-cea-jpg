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
    check('user_type','el tipo de usuario es obligatorio').notEmpty().isString(),
    check('email','el email es obligatorio').notEmpty().isString(),
    check('name','el nombre del estudiante es obligatorio').notEmpty().isString(),
    check('surname','Los apellidos son obligatorios').notEmpty().isString(),
    check('group_chief','el campo de jefe de grupo se tiene que llenar').notEmpty().isInt(),
    check('curp','el CURP es obligatorio').notEmpty().isString(),
    check('status','el estatus del alumno es obligatorio').isNumeric().exists({checkNull:true}),
    check('mobile_number','el numero de telefono es obligatorio').notEmpty().isString(),
    check('mobile_back_number','el numero de telefono es obligatorio').isString(),
    check('address','el domicilio es obligatorio').notEmpty().isString(),
    check('start_date','la fecha de inicio es obligatoria').notEmpty().isDate(),
    check('end_date','la fecha de fin es obligatoria').exists({checkNull:false}),
    check('complete_documents','falta el campo de los documentos del alumno').notEmpty().isInt(),
    check('id_group','falta el campo del id del alumno').isInt().exists({checkNull:false}),
    validateFields,
    validateJWT

], createStudent);
studentsRouter.put('/:id',[
    param('id','el id es obligatorio y tiene que ser la matricula de un alumno').notEmpty().isString(),
    check('name','el nombre del estudiante es obligatorio').notEmpty().isString(),
    check('surname','Los apellidos son obligatorios').notEmpty().isString(),
    check('group_chief','el campo de jefe de grupo se tiene que llenar').notEmpty().isString(),
    check('curp','el CURP es obligatorio').notEmpty().isString(),
    check('status','el estatus del alumno es obligatorio').notEmpty().isString(),
    check('mobile_number','el numero de telefono es obligatorio').notEmpty().isInt(),
    check('mobile_back_number','el numero de telefono es obligatorio').notEmpty().isInt(),
    check('address','el domicilio es obligatorio').notEmpty().isString(),
    check('start_date','la fecha de inicio es obligatoria').notEmpty().isDate(),
    check('end_date','la fecha de fin es obligatoria').notEmpty().isDate(),
    check('complete_documents','falta el campo de los documentos del alumno').notEmpty().isInt(),
    validateFields,
    validateJWT

], updateStudent);

studentsRouter.delete('/:id',[
    param('id','el id es obligatorio y tiene que ser la matricula de un alumno').notEmpty().isString(),
    validateFields,
    validateJWT
], deleteStudent);

module.exports = studentsRouter;