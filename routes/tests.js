const { Router } = require("express");
const { check } = require("express-validator");
const { assignTestToStudent, getTests, changeApplicationDate } = require("../controllers/testsController");
const { checkStudentExistence, hasStudentTakenCourse } = require("../middlewares/dbValidations");
const validateJWT = require("../middlewares/validar-jwt");
const { validateFields } = require("../middlewares/validateFields");

const testRouter = Router();

testRouter.post('/',[
    validateJWT,
    check('matricula','La matricula del estudiante es obligatoria.').notEmpty().isLength({max:15}),
    check('id_course','El id del curso es un número y es obligatorio.').notEmpty().isLength({max:15}),
    check('application_date','La fecha de aplicación del examen es obligatoria y valida.').notEmpty().isLength({max:15}),
    validateFields,
    checkStudentExistence,
    hasStudentTakenCourse
],assignTestToStudent)

testRouter.get('/',[
    validateJWT,
],getTests)

testRouter.put('/:id_test',[
    check('application_date','La nueva fecha de aplicación del exámen es obligatoria y debe de ser valida').isDate(),
    validateFields,
    validateJWT,
],changeApplicationDate)
module.exports = testRouter;
