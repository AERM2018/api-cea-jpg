const { response } = require("express");
const { QueryTypes } = require("sequelize");
const { db } = require("../database/connection")
const {getUserById} = require('../queries/queries');
const { createJWT } = require("../helpers/jwt");
const bcrypt = require('bcryptjs');
const User = require("../models/user");

const signup = async( req, res = response ) => {
    const { id, user_type, email,  password} =  req.body
    const salt = bcrypt.genSaltSync()
    const passwordEncrypted = bcrypt.hashSync(password,salt)
    const user = new User({user_type, email, password : passwordEncrypted})
    await user.save()

    res.status(201).json({
        ok :true,
        msg : "Admin creado correctamente"
    })
}
const login = async( req, res = response ) => {
    let user;
    let passValidation;
    const { id, password } = req.body;
    if( id === 'admin'){
        user = await User.findOne( {
            where : {'user_type' : 'admin'}
        })

        if(!user){
            return res.status(404).json({
                ok : false,
                msg : 'No se encontró a ningun usuario administrador'
            })
        }

        user.id_role = 1
        passValidation = bcrypt.compareSync(password,user.password);


    }else{
        const normalUser = await db.query(getUserById,{
            replacements : {'id':id},
            type : QueryTypes.SELECT});
        
        user = normalUser[0]
    
        if(!user){
            return res.status(404).json({
                ok : false,
                msg : `El usuario con id ${id} no existe, verifiquelo por favor`
            })
        }
        passValidation = bcrypt.compareSync(password, user.password)
    }

    if(!passValidation){
        return res.status(400).json({
            ok : false,
            msg : `Datos de acceso erroneos, verifiquelos por favor.`
        })
    }
    
    // get data and create token
    const {id_user,user_type, id_role} = user
    const token = await createJWT(id_user,user_type,id_role)

    res.status(200).json({
        ok : true,
        token
    })
    
}

const revalidateJWT = async( req, res = response) => {
    try {
        const { id_user, user_type, id_role} = req
        const token = await createJWT(id_user,user_type,id_role)
        return res.status(200).json({
            ok :true,
            token
        })
    } catch ( err ) {
        console.log(err);
        return res.status(500).json({
            ok :false,
            msg : "Ocurrio un error"
        })
    }



}

module.exports = {
    login,
    revalidateJWT,
    signup
}