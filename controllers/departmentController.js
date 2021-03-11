const Department = require('../models/department')
const { createJWT } = require("../helpers/jwt");


const getAllDepartments = async (req, res) => {
    const departments = await Department.findAll();
    let token;
    if (req.revaToken) {
        const { id_user, user_type, id_role } = req
        token = await createJWT(id_user, user_type, id_role)
    }
    return res.status(200).json({
        ok: true,
        departments,
        token
    })
}

const createDepartment = async (req, res) => {
    const { body } = req;
    try {

        const department = new Department(body);
        await department.save()

    } catch (error) {
        return res.status(500).json({
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
        msg: "department creado correctamente",
        token
    })



}
const updateDepartament = async (req, res) => {
    const { id } = req.params;
    const { body } = req;
    try {
        const department = await Department.findByPk(id);
        if (!department) {
            return res.status(404).json({
                msg: "No existe una department con el id " + id,
            });
        }

        await department.update(body);
        let token;
        if (req.revaToken) {
            const { id_user, user_type, id_role } = req
            token = await createJWT(id_user, user_type, id_role)
        }
        res.status(200).json({
            ok: true,
            msg: "El departamento se actualizo correctamente",
            token
        })


    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg: "Hable con el administrador"
        })
    }
}
const deleteDepartament = async (req, res) => {
    const { id } = req.params;
    const { body } = req;

    const department = await Department.findByPk(id);
    if (!department) {
        return res.status(404).json({
            msg: "No existe un department con el id " + id,
        });
    }

    await department.destroy(body);
    let token;
    if (req.revaToken) {
        const { id_user, user_type, id_role } = req
        token = await createJWT(id_user, user_type, id_role)
    }
    res.status(200).json({
        ok: true,
        msg: "El departamento se elimino correctamente",
        token
    })


}






module.exports = {
    getAllDepartments,
    createDepartment,
    updateDepartament,
    deleteDepartament
}
