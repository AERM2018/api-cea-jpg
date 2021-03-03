const State = require("../models/state")

const getAllStates = async( req, res ) => {
    try {
        const states = await State.findAll({
            attributes : { exclude : ['id','createdAt','updatedAt']}
        })
    
        return res.status(200).json({
            states
        })
    } catch ( err ) {
        console.log(err)
        return res.state(500).json({
            msg : "Hable con el administrador"
        })
    }
}
const createState = async( req, res  ) => {
    const { body } = req;
    try{
        const state = new State( body );
        await state.save();
    }catch(err){
        console.log(err)
        return res.state(500).json({
            msg : "Hable con el administrador"
        })
    }

    res.status(201).json({
        msg : "Estado creado correctamente"
    })
}

const updateState = async( req, res ) => {
    const { id } = req.params
    const { body } = req;

    try {
        // Check if the record exists before updating
        const state = await State.findByPk(id)
        if (!state) {
            return res.status(404).json({
                ok : false,
                msg : `El estado con id ${id} no existe, verifiquelo por favor.`
            })
        }

        // Update record in the database
        await State.update(body, {
            where: { 'id_state': id }
        })

        return res.status(200).json({
            ok : true,
            msg : 'Estado actualizado correctamente'
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            ok : false,
            msg : 'Hable con el administrador'
        })
    }
}

const deleteState = async( req, res ) => {
    const { id } = req.params

    try{
        const state = await State.findByPk( id );
        
        // Check if the state exists
        if( !state ){
            return res.status(404).json({
                ok : false,
                msg : `El estado con id ${id} no existe, verifiquelo por favor.`
            })
        }
    
        // Delete the record of the course
        await state.destroy()
    
        res.status(200).json({
            ok : true,
            msg : 'Estado eliminado correctamente'
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
    getAllStates,
    createState,
    updateState,
    deleteState
}