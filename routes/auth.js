const {Router} = require('express');
const rateLimit = require('express-rate-limit');
const { check } = require('express-validator');
const { login, revalidateJWT, signup, sendForgotPassCode, verifyForgotPassCode, changePassword } = require('../controllers/auth');
const { loginRateLimit, loginFailedAttempsLimiter } = require('../middlewares/auth');
const { checkUserExistance } = require('../middlewares/dbValidations');
const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const authRouter = Router();

// const limiter = rateLimit({
//     windowMs : 15000,
//     max : 2,
//     message : "El numero de intentos de inicio de sesión fue superado, espere 5 minutos y vuelva a intarlo"
// })

authRouter.post('/login',loginFailedAttempsLimiter,login)
authRouter.post('/forgotPassword',
    [
        checkUserExistance,
        validateFields
    ]
,sendForgotPassCode)
authRouter.post('/forgotPassword/verify',verifyForgotPassCode)
authRouter.post('/resetPassword/:id_user/:token',[
    check('id_user','El id de usuario es obligatorio.'),
    check('token','El token es obligatorio y debe de ser un json web token valido.').isJWT(),
    validateFields
],changePassword)
authRouter.get('/renew', validateJWT, revalidateJWT) 
//authRouter.post('/signup', signup)
// Eliminar

module.exports = authRouter;