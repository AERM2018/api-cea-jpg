const { db } = require("../database/connection");
const Municipality = require("../models/municipality");
const State = require("../models/state");

const getAllMunicipalities = async( req, res ) => {
    const [municipalities] = await db.query(
        `SELECT mun.id_municipality, sta.id_state, mun.municipality FROM municipalities mun LEFT JOIN states sta ON mun.id_state = sta.id_state`
    )
    res.status(200).json({
        ok: true,
        municipalities
    })
}

const createMunicipality = async( req, res  ) => {
    const { body } = req;
    const {id_state} = body
    try {

        // Check if the state exist
        const state = await State.findByPk(id_state)
        if ( !state ) {
            return res.status(404).json({
                ok: false,
                msg: `El estado con id ${id_state} no existe` 
            })
        }

        //  Create and save course
        const municipality = new Municipality(body);
        await municipality.save();

        res.status(201).json({
            ok: true,
            msg: 'Municipio creado correctamente'
        })
    } catch (err) {
        console.log(err)
<<<<<<< HEAD
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
=======
        return res.status(500).json({
            msg : "Hable con el administrador"
>>>>>>> Johan
        })
    }


}

const updateMunicipality = async( req, res ) => {
    const { id } = req.params
    const { body } = req;

    try {
        // Check if the record exists before updating
        const municipality = await Municipality.findByPk(id)
        if (!municipality) {
            return res.status(404).json({
                ok : false,
                msg : `El municipio con id ${id} no existe, verifiquelo por favor.`
            })
        }

        // Update record in the database
        await Municipality.update(body, {
            where: { 'id_municipality': id }
        })

        return res.status(200).json({
            ok : true,
            msg : 'Municipio actualizado correctamente'
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            ok : false,
            msg : 'Hable con el administrador'
        })
    }
}

const deleteMunicipality = async( req, res) => {
    const { id } = req.params

    try{
        const municipality = await Municipality.findByPk( id );
        
        // Check if the course exists
        if( !municipality ){
            return res.status(404).json({
                ok : false,
                msg : `El municipio con id ${id} no existe, verifiquelo por favor.`
            })
        }
    
        // Delete the record of the municipality
        await municipality.destroy()
    
        res.status(200).json({
            ok : true,
            msg : 'Municipio eliminado correctamente'
        })

    }catch( err ){
        console.log(err)
        return res.status(500).json({
            ok : false,
            msg : 'Hable con el administrador'
        })
    }
}

module.exports = {
    getAllMunicipalities,
    createMunicipality,
    updateMunicipality,
    deleteMunicipality
}