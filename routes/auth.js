const {Router} = require('express');
const { login, revalidateJWT, signup } = require('../controllers/auth');
const validateJWT = require('../middlewares/validar-jwt');

const authRouter = Router();

authRouter.post('/login', login)
authRouter.get('/renew', validateJWT, revalidateJWT)
//authRouter.post('/signup', signup)
// Eliminar

module.exports = authRouter;