const { Router } = require('express');
const { check, param } = require('express-validator');
const { getAllGroups, createGroup,
    updateGroup, deleteGroup, addCourseGroup, getStudentsFromGroup } = require('../controllers/groupsController');
const { checkGroupExistence } = require('../middlewares/dbValidations');
const { isValidSchedule } = require('../middlewares/schedule');
const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const groupsRouter = Router();

groupsRouter.get('/', [
    validateJWT
], getAllGroups);

groupsRouter.post('/', [
    check('id_major', 'El id de la cerrera es obligatorio y tiene que un numero entero').notEmpty().isNumeric(),
    check('name_group', 'El nombre del grupo es obligaotorio y tiene que tener como maximo 15 caracteres').not().isEmpty().isLength({ max: 15 }),
    // check('entry_year','El año de entrada es obligatorio').notEmpty().isDate(),
    // check('end_year','El año de salida es obligatorio').notEmpty().isDate(),
    check('time_tables','Es obligatorio seleccionar por lo menos un dia para el horario').isArray({ min : 1 }),
    validateFields,
    validateJWT,
    isValidSchedule
], createGroup);

groupsRouter.put('/:id', [
    param('id', 'El id del grupo es obligatorio y debe ser un numero entero').isNumeric(),
    check('name_group', 'El nombre del grupo es obligaotorio y tiene que tener como maximo 15 caracteres').not().isEmpty().isLength({ max: 15 }),
    // check('entry_year','El año de entrada es obligatorio').notEmpty().isDate(),
    // check('end_year','El año de salida es obligatorio').notEmpty().isDate(),
    validateFields,
    validateJWT

], updateGroup);

groupsRouter.delete('/:id', [
    param('id', 'El id del grupo es obligatorio y debe ser un numero entero').isNumeric(),
    validateFields,
    validateJWT

], deleteGroup);

groupsRouter.post('/:id/addcourse', [
    param('id', 'El id del grupo es obligatorio y debe ser un numero entero').isNumeric(),
    check('id_course', 'El id de la materia es obligatorio y tiene que un numero entero').notEmpty().isNumeric(),
    check('start_date', 'La fecha de inicio es obligatorio').notEmpty().isDate(),
    check('end_date', 'La fecha de fin es obligatorio').notEmpty().isDate(),
    validateFields,
    validateJWT

], addCourseGroup);

groupsRouter.get('/:id_group/students',[
    check('id_group','El id del grupo es obligatorio y debe de ser un numero entero').isNumeric(),
    checkGroupExistence,
    validateFields,
    validateJWT
], getStudentsFromGroup)

module.exports = groupsRouter;