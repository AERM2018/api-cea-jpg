const { Router } = require('express');
const { getAllStates, addState } = require('../controllers/statesController');

const statesRouter = Router();

statesRouter.get('/', getAllStates);
statesRouter.post( '/', addState)


module.exports = statesRouter;