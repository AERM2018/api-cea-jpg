const {Router} = require('express');
const { login, revalidateJWT } = require('../controllers/auth');
const validateJWT = require('../middlewares/validar-jwt');

const authRouter = Router();

authRouter.get('/login', login)
authRouter.get('/renew', validateJWT, revalidateJWT)


module.exports = authRouter;