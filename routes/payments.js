const { Router } = require('express');
const { check } = require('express-validator');
const { getAllPayments, createPayment, deletePayment, payForPayment, getAllPaymentsByGroup, getAllPaymentsByStudent, getPricesPayments} = require('../controllers/paymentController');
const { checkStudentExistence, checkPaymentExistence, checkGroupExistence, checkEmployeeExistence } = require('../middlewares/dbValidations');
const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const paymentsRouter = Router();

paymentsRouter.get('/',[
    validateJWT
], getAllPayments)

paymentsRouter.get('/groups/:id_group',[
    check('id_group','El id del grupo es obligatoria.'),
    checkGroupExistence,
    validateFields,
    validateJWT
], getAllPaymentsByGroup)

paymentsRouter.get('/students/:matricula',[
    check('matricula','El id del estudiante es obligatorio.'),
    validateFields,
    checkStudentExistence,
    validateJWT
], getAllPaymentsByStudent)

paymentsRouter.get('/prices',[ 
    validateJWT
], getPricesPayments)

paymentsRouter.post('/',[
    check('matricula',"La matricula del estudiante es obligatoria y debe de tener como máximo 15 caracteres").isString().notEmpty().isLength({ max : 15 }),
    check('id_user',"El id del usuario es obligatorio").isInt().exists({ checkNull : true}),
    check('payment_method',"El metódo de pago es obligatorio").exists({ checkNull : true}).custom( 
        (payment_method) => { 
            if(!['Tarjeta','Depósito','Efectivo'].includes(payment_method)){
                throw Error('Métdodo de pago invalido.')
            }else{
                return true
            }}),
    check('payment_type',"El tipo de pago es obligatorio").exists({ checkNull : true}).custom( 
        (payment_type) => { 
            if(!['Documento','Inscripción','Materia'].includes(payment_type)){
                throw Error('Tipo de pago invalido.')
            }else{
                return true
            }}),
    check('amount',"El monto del pago es obligatorio").isFloat().exists({ checkNull : true }),
    validateFields,
    validateJWT,
    checkStudentExistence,
    checkEmployeeExistence
],createPayment)

paymentsRouter.delete('/:id_payment',[
    check('id_payment','El id del pago es obligatorio').isInt().exists({ checkNull : true}).custom(checkPaymentExistence),
    validateFields,
    validateJWT
], deletePayment)

paymentsRouter.patch('/:id_payment/payFor',[
    check('id_payment','El id del pago es obligatorio').isInt().exists({ checkNull : true}).custom(checkPaymentExistence),
    check('pay_amount','El monto de abono es obligatorio').isFloat().exists({ checkNull : true}),
    validateFields,
    validateJWT
], payForPayment)
module.exports = paymentsRouter;