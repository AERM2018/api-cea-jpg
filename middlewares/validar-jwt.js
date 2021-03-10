const moment = require('moment');
const { response } = require("express");
const { verify, decode} = require('jsonwebtoken')
const validateJWT = ( req, res = response, next) => {
    const token = req.headers['x-token'];
    if(!token){
        return res.status(401).json({
            ok : false,
            msg : 'Es necesario enviar el token'
        })
    }

    try {
        const {id_user,user_type,id_role,exp} = verify(token,process.env.SECRET_JWT)
        if(exp-moment().unix() <= 45){
            req.id_user = id_user;
            req.user_type = user_type;
            req.id_role = id_role;
            req.revaToken = true
        }
        next()
        
    } catch (error) {
        return res.status(401).json({
            ok : false,
            msg : 'El token es inválido'
        })
    }

}

module.exports = validateJWT