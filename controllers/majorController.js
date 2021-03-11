const Major = require('../models/major')
const { createJWT } = require("../helpers/jwt");


const getAllMajors = async (req, res) => {
    const majors = await Major.findAll();
    let token;
    if (req.revaToken) {
        const { id_user, user_type, id_role } = req
        token = await createJWT(id_user, user_type, id_role)
    }
    return res.status(200).json({
        ok: true,
        majors,
        token
    })
}

const createMajor = async (req, res) => {
    const { body } = req;

    try {

        const major = new Major(body);
        await major.save()



    } catch (error) {
        return res.status(500).json({
            ok:false,
            msg: "Hable con el administrador",
        })
    }

    let token;
    if (req.revaToken) {
        const { id_user, user_type, id_role } = req
        token = await createJWT(id_user, user_type, id_role)
    }
    res.status(201).json({
        ok: true,
        msg: "Major creado correctamente",
        token
    })



}
const updateMajor = async (req, res) => {
    const { id } = req.params;
    const { body } = req;
    try {
        const major = await Major.findByPk(id);
        if (!major) {
            return res.status(404).json({
                ok:false,
                msg: "No existe una Major con el id " + id,
            });
        }

        await major.update(body);
        let token;
        if (req.revaToken) {
            const { id_user, user_type, id_role } = req
            token = await createJWT(id_user, user_type, id_role)
        }
        res.status(200).json({
            ok: true,
            msg: "El materia se actualizo correctamente",
            token
        })


    } catch (error) {
        console.log(error)
        return res.state(500).json({
            msg: "Hable con el administrador"
        })
    }
}
const deleteMajor = async (req, res) => {
    const { id } = req.params;
    const { body } = req;

    const major = await Major.findByPk(id);
    if (!major) {
        return res.status(404).json({
            ok:false,
            msg: "No existe una Major con el id " + id,
        });
    }

    await major.destroy(body);
    let token;
    if (req.revaToken) {
        const { id_user, user_type, id_role } = req
        token = await createJWT(id_user, user_type, id_role)
    }
    res.status(200).json({
        ok: true,
        msg: "La materia se elimino correctamente",
        token
    })


}






module.exports = {
    getAllMajors,
    createMajor,
    updateMajor,
    deleteMajor
}
