const { validationResult } = require("express-validator")

const validateFields = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            ok:false,
            msg:'Ocurrio un error al procesar tu peticion',
            errors:errors.mapped()
        })
    }
    next()
}

module.exports={
    validateFields
}