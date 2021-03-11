const { response } = require("express");
const { QueryTypes } = require("sequelize");
const { db } = require("../database/connection")
const {getUserById} = require('../queries/queries');
const { createJWT } = require("../helpers/jwt");
const bcrypt = require('bcryptjs');
const login = async( req, res = response ) => {
    const { id, password} = req.body;
    const user = await db.query(getUserById,{
        replacements : {'id':id},
        type : QueryTypes.SELECT});

    if(user.length < 1){
        return res.status(404).json({
            ok : false,
            msg : `El usuario con id ${id} no existe, verifiquelo por favor`
        })
    }
    const verifyPassword = bcrypt.compareSync(password, user[0].password)
    if(!verifyPassword){
        return res.status(400).json({
            ok : false,
            msg : `Datos de acceso erroneos, verifiquelos por favor.`
        })
    }
    
    // get data and create token
    const {id_user,user_type, id_role} = user[0]
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
    revalidateJWT
}