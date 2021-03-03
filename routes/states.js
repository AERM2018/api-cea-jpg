const { Router } = require('express');
const { check } = require('express-validator');
const { getAllStates, createState, deleteState, updateState } = require('../controllers/statesController');
const { validateFields } = require('../middlewares/validateFields');

const statesRouter = Router();

statesRouter.get('/', getAllStates);

statesRouter.post( '/', [ 
    check('state','El nombre del estado es obligatorio').notEmpty(),
    validateFields
],createState);

statesRouter.put( '/:id', [ 
    check('state','El nombre del estado es obligatorio').notEmpty(),
    validateFields
],updateState);

statesRouter.delete('/:id',deleteState)


module.exports = statesRouter;