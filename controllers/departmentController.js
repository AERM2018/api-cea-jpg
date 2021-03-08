const Department = require('../models/department')



const getAllDepartments = async (req, res) => {
    const departments = await Department.findAll();

    return res.status(200).json({
        ok:true,
        departments
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
    res.status(201).json({
        ok:true,
        msg: "department creado correctamente"
    })



}
const updateDepartament = async (req, res) => {
    const { id } = req.params;
    const { body } = req;
    try {
        const department = await Department.findByPk(id);
        if(!department){
            return res.status(404).json({
                msg: "No existe una department con el id "+id,
            });
        }
        
        await department.update(body);
        res.status(200).json({
            ok:true,
            msg:"El departamento se actualizo correctamente"
        })
    
    
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg : "Hable con el administrador"
        })
    }
}
const deleteDepartament = async (req, res) => {
    const { id } = req.params;
    const { body } = req;
 
        const department = await Department.findByPk(id);
        if(!department){
            return res.status(404).json({
                msg: "No existe un department con el id "+id,
            });
        }
        
        await department.destroy(body);
        res.status(200).json({
            ok:true,
            msg:"El departamento se elimino correctamente"
        })
    

}






module.exports = {
    getAllDepartments,
    createDepartment,
    updateDepartament,
    deleteDepartament
}
