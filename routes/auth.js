const {Router} = require('express');
const rateLimit = require('express-rate-limit');
const { login, revalidateJWT, signup } = require('../controllers/auth');
const { loginRateLimit } = require('../middlewares/auth');
const validateJWT = require('../middlewares/validar-jwt');

const authRouter = Router();

// const limiter = rateLimit({
//     windowMs : 15000,
//     max : 2,
//     message : "El numero de intentos de inicio de sesión fue superado, espere 5 minutos y vuelva a intarlo"
// })

authRouter.post('/login',loginRateLimit,login)
authRouter.get('/renew', validateJWT, revalidateJWT)
//authRouter.post('/signup', signup)
// Eliminar

module.exports = authRouter;