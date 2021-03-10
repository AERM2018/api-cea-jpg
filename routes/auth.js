const {Router} = require('express');
const { login } = require('../controllers/auth');

const authRouter = Router();

authRouter.get('/', login)


module.exports = authRouter;