const { response } = require("express");
const { QueryTypes } = require("sequelize");
const jwt = require('jsonwebtoken');
const { db } = require("../database/connection")
const {getUserById} = require('../queries/queries');
const { createJWT } = require("../helpers/jwt");
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
    
    // get data and create token
    const {id_user,user_type, id_role} = user[0]
    const token = await createJWT(id_user,user_type,id_role)
    
    res.status(200).json({
        ok : true,
        token
    })

}


module.exports = {
    login
}