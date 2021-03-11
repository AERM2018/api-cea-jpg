const { Router } = require('express');
const { check, param } = require('express-validator');
const { getAllStates, createState, deleteState, updateState } = require('../controllers/statesController');
const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const statesRouter = Router();

statesRouter.get('/', [validateJWT], getAllStates);

statesRouter.post( '/', [ 
    check('state','El nombre del estado es obligatorio').notEmpty(),
    validateFields,
    validateJWT
],createState);

statesRouter.put( '/:id', [ 
    param('id', 'El id del estado es obligatorio y debe de ser numero entero').isNumeric(),
    check('state','El nombre del estado es obligatorio').notEmpty(),
    validateFields,
    validateJWT
],updateState);

statesRouter.delete('/:id',[
    param('id', 'El id del estado es obligatorio y debe de ser numero entero').isNumeric(),
    validateJWT
],deleteState)


module.exports = statesRouter;