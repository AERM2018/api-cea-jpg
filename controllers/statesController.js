const State = require("../models/state")

const addState = async( req, res  ) => {
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

const getAllStates = async( req, res ) => {
    const states = await State.findAll({
        attributes : { exclude : ['id','createdAt','updatedAt']}
    })

    return res.status(200).json({
        states
    })
}

module.exports = {
    getAllStates,
    addState
}