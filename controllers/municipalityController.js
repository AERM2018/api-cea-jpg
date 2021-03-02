const Municipality = require("../models/municipality");


const addMunicipality = async( req, res  ) => {
    const { body } = req;
    try{
        const municipality = new Municipality( body );
        await municipality.save();
    }catch(err){
        console.log(err)
        return res.state(500).json({
            msg : "Hable con el administrador"
        })
    }

    res.status(201).json({
        msg : "Municipality creado correctamente"
    })


}

const getAllMunicipalities = async( req, res ) => {
    const municipalities = await Municipality.findAll({
        attributes : { exclude : ['id','createdAt','updatedAt']}
    })

    return res.status(200).json({
        municipalities
    })
}

module.exports = {
    getAllMunicipalities,
    addMunicipality
}