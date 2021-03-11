const {Router} = require('express');
const { login, revalidateJWT, signup } = require('../controllers/auth');
const validateJWT = require('../middlewares/validar-jwt');

const authRouter = Router();

authRouter.get('/login', login)
authRouter.get('/renew', validateJWT, revalidateJWT)
authRouter.post('/signup',signup)


module.exports = authRouter;