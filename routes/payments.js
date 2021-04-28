const { Router } = require('express');
const { check } = require('express-validator');
const { getAllPayments, createPayment, deletePayment, payForPayment, getAllPaymentsByGroup, getAllPaymentsByStudent, getPricesPayments} = require('../controllers/paymentController');
const { checkStudentExistence, checkPaymentExistence, checkGroupExistence, checkEmployeeExistence, checkStudentEnroll, checkCardExistence, isValidDocument, isValidCard, isValidPaymentType, isValidPaymentMethod } = require('../middlewares/dbValidations');
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
    check('payment_method',"El metódo de pago es obligatorio").exists({ checkNull : true}).custom(isValidPaymentMethod),
    check('payment_type',"El tipo de pago es obligatorio").exists({ checkNull : true}).custom(isValidPaymentType),
    check('amount',"El monto del pago es obligatorio").isFloat().exists({ checkNull : true }),
    check('id_card','La tarjeta a la cual va dirigo el pago es necesario.').exists({ checkNull : false }).custom( (id_card,{req}) => isValidCard(id_card, req)),
    check('document_type','El tipo de documento es necesario.').exists({ checkNull : false }).custom( (document_type, {req}) => isValidDocument(document_type, req) ),
    validateFields,
    validateJWT,
    checkStudentExistence,
    checkEmployeeExistence,
    checkStudentEnroll,
    checkCardExistence
],createPayment)

paymentsRouter.delete('/:id_payment',[
    check('id_payment','El id del pago es obligatorio').isInt().exists({ checkNull : true}),
    validateFields,
    checkPaymentExistence,
    validateJWT
], deletePayment)

paymentsRouter.patch('/:id_payment/payFor',[
    check('id_payment','El id del pago es obligatorio').isInt().exists({ checkNull : true}),
    check('pay_amount','El monto de abono es obligatorio').isFloat().exists({ checkNull : true}),
    check('payment_method','El metódo de pago es obligatorio').custom( isValidPaymentMethod ),
    check('id_card','La tarjeta a la cual va dirigo el pago es necesario').exists({ checkNull : false }).custom( ( payment_method, { req } ) => isValidCard( payment_method, req ) ),
    validateFields,
    checkPaymentExistence,
    checkCardExistence,
    validateJWT
], payForPayment)
module.exports = paymentsRouter;