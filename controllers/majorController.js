const Major = require('../models/major')


const getAllMajors = async (req, res) => {
    const majors = await Major.findAll();
  
    
    return res.status(200).json({
        ok: true,
        majors
    })
}

const createMajor = async (req, res) => {
    const { major_name } = req.body;
    try {
        
        const [major, created] = await Major.findOrCreate({
            where:{major_name}
        })
        if(created){
            res.status(200).json({
                ok: true,
                msg: "La carrera se creo correctamente"
            })
        }else{
            return res.status(500).json({
                ok:false,
                msg: `Ya existe una carrera con el nombre '${major_name}'`,
            })
        }
    } catch (error) {
        console.log( error )
        return res.status(500).json({
            ok:false,
            msg: "Hable con el administrador",
        })
    }

    
    



}
const updateMajor = async (req, res) => {
    const { id } = req.params;
    const { body } = req;
    const {major_name}= body;
    try {
        const major = await Major.findByPk(id);
        if (!major) {
            return res.status(404).json({
                ok:false,
                msg: "No existe una carrera con el id " + id,
            });
        }
        const majorName = await Major.findOne({
            where: {
                major_name,
                id_major: { [Op.ne]: id }
            }
        });

        if (majorName){
            return res.status(400).json({
                ok: false,
                msg: `Ya existe una carrera con el nombre ${major_name}`
            })
        }

        await major.update(body);
        
        res.status(200).json({
            ok: true,
            msg: "La carrera se actualizo correctamente"
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

    try {
        const major = await Major.findByPk(id);
        if (!major) {
            return res.status(404).json({
                ok:false,
                msg: "No existe una carrera con el id " + id,
            });
        }
    
        await major.destroy(body);
        res.status(200).json({
            ok: true,
            msg: "La carrera se elimino correctamente",
            
        })
    } catch ( err ) {
        console.log(err)
        return res.state(500).json({
            msg: "Hable con el administrador"
        })
    }


}






module.exports = {
    getAllMajors,
    createMajor,
    updateMajor,
    deleteMajor
}
