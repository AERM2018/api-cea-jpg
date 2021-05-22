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
    check('observation','La matricula del estudiante es obligatoria').isString().notEmpty(),
    check('expense_type','El id del departmento es obligatorio').isInt().exists({ checkNull : true}),
    check('amount','Tipo de documento es obligatorio').isFloat().exists({checkNull: true}),
    validateFields,
    checkEmployeeExistence
    
], createExpense)

expenseRouter.put('/:id',[
    param('id','El id de la solicitud es obligatorio y debe de ser un numero entero').isNumeric(),
    check('amount','Tipo de documento es obligatorio').isFloat().exists({checkNull: true}),
    check('observation','La matricula del estudiante es obligatoria').isString().notEmpty(),
    check('expense_type','El id del departmento es obligatorio').isInt().exists({ checkNull : true}),
    validateJWT,
    validateFields
], updateExpense)

expenseRouter.delete('/:id', [
    param('id','El id de la solicitud es obligatorio y debe de ser un numero entero').isNumeric(),
    validateFields,
    validateJWT
], deleteExpense)


module.exports = expenseRouter