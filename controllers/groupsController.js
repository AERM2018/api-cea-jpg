const Gro_tim = require('../models/gro_tim');
const Group = require('../models/group');
const Time_tables = require('../models/time_tables');
const Major= require('../models/major');



const getAllGroups = async (req, res) => {
    const groups = await Group.findAll();

    return res.status(200).json({
        groups
    })
}

const createGroup = async (req, res) => {
    const { body } = req;
    const {id_major, name_group, entry_year, end_year}=body;
    const { day, start_hour, finish_hour } = body;
    let id_group,id_time_table
    try { 
        const major = await Major.findByPk(id_major);
        if(!major){
            return res.status(404).json({
                msg: "No existe una carrera con el id "+id_major,
            });
        }
        const group = new Group({id_major,name_group,entry_year,end_year});
        const newGroup=await group.save()
        const groupJson = newGroup.toJSON();
        id_group= groupJson['id_group']
        console.log(id_group)

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg: "Hable con el administrador",
        })
    }
    try {
        const time_table= new Time_tables({day,start_hour,finish_hour})
        const newTimeTable = await time_table.save();
        const newTimeTableJson=newTimeTable.toJSON(); 
        id_time_table = newTimeTableJson['id_time_table']
        console.log(id_time_table)
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg: "Hable con el administrador",
        })
    }
    
    try {
        const gro_tim = new Gro_tim({id_group,id_time_table});
        await gro_tim.save();
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg: "Hable con el administrador",
        })
    }

    res.status(201).json({
        msg: "Grupo creado correctamente"
    })

   


}
const updateGroup = async (req, res) => {
    const { id } = req.params;
    const { body } = req;
    try {
        const group = await Group.findByPk(id);
        if(!group){
            return res.status(404).json({
                msg: "No existe un grupo con el id "+id,
            });
        }
        
        await group.update(body);
        res.json( group )
    
    
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg : "Hable con el administrador"
        })
    }
}
const deleteGroup = async (req, res) => {
    const { id } = req.params;
    const { body } = req;
 
        const group = await Group.findByPk(id);
        if(!group){
            return res.status(404).json({
                msg: "No existe un grupo con el id "+id,
            });
        }
        
        await group.destroy(body);
        res.json(group)
    

}






module.exports = {
    getAllGroups,
    createGroup,
    updateGroup,
    deleteGroup
}