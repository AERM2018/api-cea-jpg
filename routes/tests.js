const { Router } = require("express");
const { check } = require("express-validator");
const { assignTestToStudent, getTests } = require("../controllers/testsController");
const { checkStudentExistence } = require("../middlewares/dbValidations");
const validateJWT = require("../middlewares/validar-jwt");
const { validateFields } = require("../middlewares/validateFields");

const testRouter = Router();

testRouter.post('/',[
    validateJWT,
    check('matricula','La matricula del estudiante es obligatoria.').notEmpty().isLength({max:15}),
    check('id_course','El id del curso es un número y es obligatorio.').notEmpty().isLength({max:15}),
    check('application_date','La fecha de aplicación del examen es obligatoria y valida.').notEmpty().isLength({max:15}),
    validateFields,
    checkStudentExistence
],assignTestToStudent)

testRouter.get('/',[
    validateJWT,
],getTests)
module.exports = testRouter;
