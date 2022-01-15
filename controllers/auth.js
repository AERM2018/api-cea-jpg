const { response } = require("express");
const { QueryTypes, fn, col } = require("sequelize");
const { db } = require("../database/connection")
const { getUserById } = require('../queries/queries');
const { createJWT, createPasswordJWT } = require("../helpers/jwt");
const bcrypt = require('bcryptjs');
const User = require("../models/user");
const randomatic = require('randomatic');
const moment = require('moment');
const { getLogInInfo } = require("../helpers/getLogInInfo");
const { transporter } = require("../helpers/mailer");
const Forgot_pass_code = require("../models/forgot_pass_code");
const Rol_use = require("../models/rol_use");
const { verify } = require("jsonwebtoken");
const { printAndSendError } = require("../helpers/responsesOfReq");

const signup = async (req, res = response) => {
    const { id, user_type, email, password } = req.body
    const salt = bcrypt.genSaltSync()
    const passwordEncrypted = bcrypt.hashSync(password, salt)
    const user = new User({ user_type, email, password: passwordEncrypted })
    await user.save()

    res.status(201).json({
        ok: true,
        msg: "Admin creado correctamente"
    })
}

const login = async (req, res = response) => {
    let user;
    let passValidation;
    const { id, password } = req.body;
    if (id === 'admin') {
        user = await User.findOne({
            where: { 'user_type': 'admin' }
        })
        if (!user) {
            return res.status(404).json({
                ok: false,
                msg: 'No se encontró a ningun usuario administrador'
            })
        }
        user.id_role = 1
        passValidation = bcrypt.compareSync(password, user.password);
    } else {
        const normalUser = await db.query(getUserById, {
            replacements: { 'id': id },
            type: QueryTypes.SELECT
        });
        user = normalUser[0]
        console.log(user)
        if (!user) {
            return res.status(404).json({
                ok: false,
                msg: `El usuario con id ${id} no existe, verifiquelo por favor`
            })
        }
        passValidation = bcrypt.compareSync(password, user.password)
    }
    if (!passValidation) {
        return res.status(400).json({
            ok: false,
            msg: `Datos de acceso erroneos, verifiquelos por favor.`
        })
    }
    // get data and create token
    const { id_user, user_type, id_role, email } = user
    let roles = await Rol_use.findAll({where : {id_user},attributes:['id_role']})
    roles = roles.map(({id_role}) => id_role)
    const token = await createJWT(id_user, email, user_type, roles)
    const userEntityInfo = await getLogInInfo(id,user_type)
    res.status(200).json({
        ok: true,
        token,
        id_user,
        email,
        user_type,
        roles,
        user: userEntityInfo
    })

}

const revalidateJWT = async (req, res = response) => {
    try {
        const { id_user, user_type, roles, email } = req
        const token = await createJWT(id_user, email, user_type, roles)
        const userEntityInfo = await getLogInInfo(id_user,user_type)
        return res.status(200).json({
            ok: true,
            token,
            id_user,
            email,
            user_type,
            roles,
            user : userEntityInfo
        })
    } catch (err) {
        printAndSendError(res,err)
    }
}

// FIXME:Cambiar mi correo por el de la alejandría
const sendForgotPassCode = async(req, res = response) => {
    const {email} = req.body
    const user = await User.findOne({where:{email},raw:true})
    const {name,id_user} = user
    let code = `${randomatic('A0',4)}${randomatic('0',2)}`
    const codeDB = new Forgot_pass_code({code,issued_at:moment({}).toDate(),expirate_at:moment({}).add(10,'m').toDate(),id_user})
    await codeDB.save()
    await transporter.sendMail({
        from: `"Servicios escolares Alejandría" <${process.env.CONTROL_ESCOLAR_EMAIL}>`, // sender address
        to: `${name}, ${email}`, // list of receivers
        subject: "Solicitud de recuperación de contraseña", // Subject line
        html: `<p>El siguiente codigo es para restablecer su contraseña, no debe de compartirlo con nadie. Codigo: <b>${code}</b></p>`, // html body
      });
      res.sendStatus(200)
}

const verifyForgotPassCode = async(req, res = response) => {
    const {code} = req.body
    let codeDB = await Forgot_pass_code.findOne({where : {code}, raw:true})
    if(codeDB){
        Rol_use.belongsTo( User,{foreignKey:'id_user'} )
        User.hasMany( Rol_use,{foreignKey:'id_user'})
        let user = await User.findOne({
            include : {
                model : Rol_use,
                attributes : ['id_role']
            },
            where : {id_user : codeDB.id_user},
        })
        user = user.toJSON()
        const { id_user ,email } = user
        let JSONResponse;
        if(moment(codeDB.expirate_at).diff(moment({}),'m') > 0){
            let JWTPassword = await createPasswordJWT(id_user, email)
            JSONResponse = {ok:true,url:`http://localhost:3005/api-ale/v1/auth/resetPassword/${id_user}/${JWTPassword}`}
        }else{
            JSONResponse = {ok:false,msg:"El código ha vencido, vuelva a generar uno para continuar con el proceso."}
        }
        await Forgot_pass_code.destroy({where:{code}})
        return res.json(JSONResponse)
    }
    return res.json({ok:false,msg:"Código de recuperación de contraseña no encontrado."});
}

const changePassword = async(req, res = response) => {
    const {knownPassword = false} = req.query
    const {oldPassword = '', newPassword = '' } = req.body
    const { id_user, token }  = req.params
    let payload;
    try {
        if(knownPassword){
            payload = verify(token,process.env.SECRET_JWT)
            const {password} = await User.findOne({where : {id_user},raw:true})
            if(!bcrypt.compareSync(oldPassword,password)) return res.status(400).json({ok : false,msg : 'La contraseña anterior es incorrecta, verifiquela por favor.'})
        }else{
            payload = verify(token,process.env.PASSWORD_JWT)
        }
        const salt = bcrypt.genSaltSync()
        console.log(newPassword)
        const passEncrypted = bcrypt.hashSync(newPassword,salt)
        await User.update({password:passEncrypted},{where:{id_user}})
        return res.json({
            ok : true,
            msg : 'La contraseña ha sido cambiada correctamente.'
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            ok : false,
            msg : 'El link es inválido o expiró'
        })
    }
}
module.exports = {
    login,
    revalidateJWT,
    signup,
    sendForgotPassCode,
    verifyForgotPassCode,
    changePassword
}