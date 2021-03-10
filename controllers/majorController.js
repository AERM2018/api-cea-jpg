const Major = require('../models/major')



const getAllMajors = async (req, res) => {
    const majors = await Major.findAll();

    return res.status(200).json({
        ok:true,
        majors
    })
}

const createMajor = async (req, res) => {
    const { body } = req;

    try {

        const major = new Major(body);
        await major.save()
    } catch (error) {
        return res.status(500).json({
            msg: "Hable con el administrador",
        })
    }
    res.status(201).json({
        msg: "Major creado correctamente"
    })



}
const updateMajor = async (req, res) => {
    const { id } = req.params;
    const { body } = req;
    try {
        const major = await Major.findByPk(id);
        if(!major){
            return res.status(404).json({
                msg: "No existe una Major con el id "+id,
            });
        }
        
        await major.update(body);
        res.status(200).json({
            ok:true,
            msg:"El materia se actualizo correctamente"
        })
    
    
    } catch (error) {
        console.log(error)
        return res.state(500).json({
            msg : "Hable con el administrador"
        })
    }
}
const deleteMajor = async (req, res) => {
    const { id } = req.params;
    const { body } = req;
 
        const major = await Major.findByPk(id);
        if ( !major ){
            return res.status(404).json({
                msg: "No existe una Major con el id "+id,
            });
        }
        
        await major.destroy(body);
        res.status(200).json({
            ok:true,
            msg:"La materia se elimino correctamente"
        })
    

}






module.exports = {
    getAllMajors,
    createMajor,
    updateMajor,
    deleteMajor
}
