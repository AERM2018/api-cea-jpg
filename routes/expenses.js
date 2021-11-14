const { Router, request } = require('express');
const { check, param } = require('express-validator');
const {createExpense ,getAllTheExpenses ,deleteExpense  ,updateExpense  } = require('../controllers/expensesController');
const {checkEmployeeExistence } = require('../middlewares/dbValidations');
const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const expenseRouter = Router();
expenseRouter.get('/',[
    validateJWT
], getAllTheExpenses)

expenseRouter.post('/',[
    validateJWT,
    check('observation','La observación es obligatoria').isString().notEmpty(),
    check('expense_type','El tipo de gasto es un número entero y es obligatorio').isInt().exists({ checkNull : true}),
    check('amount','El cargo del gasto es un número flotante y es obligatorio').isFloat().exists({checkNull: true}),
    validateFields,
    checkEmployeeExistence
], createExpense)

expenseRouter.put('/:id',[
    param('id','El id del gasto es un número entero y obligatorio').isNumeric(),
    check('amount','El cargo del gasto es un número flotante y es obligatorio').isFloat().exists({checkNull: true}),
    check('observation','La observación es obligatoria').isString().notEmpty(),
    check('expense_type','El tipo de gasto es un número entero y es obligatorio').isInt().exists({ checkNull : true}),
    validateJWT,
    validateFields
], updateExpense)

expenseRouter.delete('/:id', [
    param('id','El id del gasto es un número entero y obligatorio').isNumeric(),
    validateFields,
    validateJWT
], deleteExpense)


module.exports = expenseRouter