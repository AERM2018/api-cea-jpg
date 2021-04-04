const { Router } = require('express');
const { check } = require('express-validator');
const { getAllPayments, createPayment } = require('../controllers/paymentController');
const { checkStudentExistence } = require('../helpers/dbValidations');
const { getIdEmployee, getIdStudent } = require('../middlewares/getIds');
const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const paymentsRouter = Router();

paymentsRouter.get('/',[
    validateJWT
], getAllPayments)

paymentsRouter.post('/',[
    check('matricula',"La matricula del estudiante es obligatoria y debe de tener como máximo 15 caracteres").isString().notEmpty().isLength({ max : 15 }).custom(checkStudentExistence),
    check('id_user',"El id del usuario es obligatorio y debe de tener como máximo 15 caracteres").isString().notEmpty().isLength({ max : 15 }),
    check('payment_method',"El metódo de pago es obligatorio y debe de ser: Tarjeta o Déposito o Efectivo").isIn(['Tarjeta','Depósito','Efectivo']),
    check('payment_type',"El tipo de pago es obligatorio y debe de ser: Documento o Inscripción o Materia").isIn(['Documento','Inscripción','Materia']),
    check('status',"El status del pago es obligatorio").isInt().exists({ checkNull : true }),
    check('amount',"El monto del pago es obligatorio").isFloat().exists({ checkNull : true }),
    // check('payment_type',"El tipo de pago es obligatorio y debe de ser: Documento o Inscripción o Materia").isIn(['Documento','Inscripción','Materia']),
    // validateFields,
    // validateJWT
    getIdEmployee,
    getIdStudent
],createPayment)


module.exports = paymentsRouter;