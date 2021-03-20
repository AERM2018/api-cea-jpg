const Gro_tim = require('../models/gro_tim');
const Group = require('../models/group');
const Time_tables = require('../models/time_tables');
const Major = require('../models/major');
const Stu_gro = require('../models/stu_gro');


const getAllGroups = async (req, res) => {
    const groups = await Group.findAll();
    return res.status(200).json({
        ok: true,
        groups,
    })
}

const createGroup = async (req, res) => {
    const { body } = req;
    const { id_major, name_group, entry_year, end_year } = body;
    const { time_tables } = body;
    let id_group, id_time_table
    let ids_emp_tim
    try {
        const major = await Major.findByPk(id_major);
        if (!major) {
            return res.status(404).json({
                ok: false,
                msg: "No existe una carrera con el id " + id_major,
            });
        }
        const group = new Group({ id_major, name_group, entry_year, end_year });
        const newGroup = await group.save()
        const groupJson = newGroup.toJSON();
        id_group = groupJson['id_group']


    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador",
        })
    }
    try {
        ids_emp_tim = time_tables.map(async (x) => {
            let { day, start_hour, finish_hour } = x;
            const time = await Time_tables.findAll({
                where: { 'day': day, 'start_hour': start_hour, 'finish_hour': finish_hour }
            });
            if (time.length < 1) {
                const time_table = new Time_tables({ day, start_hour, finish_hour })
                const newTime_Table = await time_table.save();
                const newTime_tableJson = newTime_Table.toJSON();
                id_time_table = newTime_tableJson['id_time_table']
                return id_time_table;
            } else {
                return time[0].id_time_table
            }

        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador",
        })
    }

    try {
        ids_emp_tim.forEach(async (x) => {
            id_time_table = await x
            const gro_tim = new Gro_tim({ id_group, id_time_table });
            await gro_tim.save();

        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador",
        })
    }

    res.status(201).json({
        ok:true,
        msg: "Grupo creado correctamente"
    })




}
const updateGroup = async (req, res) => {
    const { id } = req.params;
    const { body } = req;
    try {
        const group = await Group.findByPk(id);
        if (!group) {
            return res.status(404).json({
                ok: false,
                msg: "No existe un grupo con el id " + id,
            });
        }

        await group.update(body);
      
        res.status(200).json({
            ok: true,
            msg: "El grupo se actualizo correctamente",
   
        })


    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador"
        })
    }
}
const deleteGroup = async (req, res) => {
    const { id } = req.params;
    const { body } = req;
    
    try {
        
        const group = await Group.findByPk(id);
        if (!group) {
            return res.status(404).json({
                ok: false,
                msg: "No existe un grupo con el id " + id,
            });
        }
        
        const stu_gro = await Stu_gro.findAll({
            where: {id_group:id}
        })
        stu_gro.forEach(async (grupo)=>{
            await grupo.destroy()
        })
    
        const gro_tim= await Gro_tim.findAll({
            where: {id_group:id}
        })
        gro_tim.forEach(async (grupo)=>
        {
            await grupo.destroy()
        })
    
        await group.destroy(body);
        
        res.status(200).json({
            ok: true,
            msg: "El grupo se elimino correctamente",
         
        })
    } catch ( error ) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador"
        })
    }

}






module.exports = {
    getAllGroups,
    createGroup,
    updateGroup,
    deleteGroup
}