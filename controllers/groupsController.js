const Gro_tim = require('../models/gro_tim');
const Group = require('../models/group');
const Time_tables = require('../models/time_tables');
const Major = require('../models/major');
const Stu_gro = require('../models/stu_gro');
const { Op, QueryTypes, fn, col } = require('sequelize');
const { db } = require('../database/connection');
const { getGroups } = require('../queries/queries');
const Courses = require('../models/courses')
const Gro_cou = require('../models/gro_cou');
const { response } = require('express');
const Student = require('../models/student');
const { printAndSendError } = require('../helpers/responsesOfReq');

const getAllGroups = async (req, res) => {
    try {
        const groups_no_time = await db.query(getGroups, { type: QueryTypes.SELECT })

        const groups_time = groups_no_time.map(async group => {
            const gro_tim = await Gro_tim.findAll({
                where: { id_group: group.id_group },
                attributes: ['id_time_table'],

            })
            const time_tables = await Time_tables.findAll({
                where: { id_time_table: { [Op.in]: gro_tim.map(time_table => time_table.toJSON().id_time_table) } },
                attributes: { exclude: ['id_time_table'] }
            })
            return { ...group, time_table: time_tables.map(time_table => time_table.toJSON()) }
        })

        Promise.all(groups_time).then(groups => {
            return res.status(200).json({
                ok: true,
                groups,
            })
        })
    } catch (err) {
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador"
        })
    }
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
        const groupName = await Group.findOne({
            where: { name_group }
        })
        if (!groupName) {
            const group = new Group({ id_major, name_group, entry_year, end_year });
            const newGroup = await group.save()
            const groupJson = newGroup.toJSON();
            id_group = groupJson['id_group']
        }
        else {
            return res.status(404).json({
                ok: false,
                msg: "Ya existe una un grupo con el nombre " + name_group,
            });
        }





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
        ok: true,
        msg: "Grupo creado correctamente"
    })




}
const updateGroup = async (req, res) => {
    const { id } = req.params;
    const { body } = req;
    const { id_major, name_group } = body;
    try {
        const group = await Group.findByPk(id);
        if (!group) {
            return res.status(404).json({
                ok: false,
                msg: "No existe un grupo con el id " + id,
            });
        }
        const major = await Major.findByPk(id_major);
        if (!major) {
            return res.status(404).json({
                ok: false,
                msg: "No existe una carrera con el id " + id_major
            });
        }

        const groupName = await Group.findOne({
            where: {
                name_group,
                id_group: { [Op.ne]: id }
            }
        });

        if (groupName) {
            return res.status(400).json({
                ok: false,
                msg: `Ya existe un grupo con el nombre ${name_group}`
            })
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
            where: { id_group: id }
        })
        stu_gro.forEach(async (grupo) => {
            await grupo.destroy()
        })

        const gro_tim = await Gro_tim.findAll({
            where: { id_group: id }
        })
        gro_tim.forEach(async (grupo) => {
            await grupo.destroy()
        })

        await group.destroy(body);

        res.status(200).json({
            ok: true,
            msg: "El grupo se elimino correctamente",

        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador"
        })
    }

}

const addCourseGroup = async (req, res) => {
    const { id:id_group} = req.params
    const { id_course, ...resto } = req.body;


    try {
        const group = await Group.findByPk(id_group);
        if (!group) {
            return res.status(404).json({
                ok: false,
                msg: "No existe un grupo con el id " + id_group,
            });
        }
        const course = await Courses.findByPk(id_course);
        if (!course) {
            return res.status(404).json({
                ok: false,
                msg: `No existe una materia con el id ${ id_course }`
            })
        }
        const groupCourse = await Gro_cou.findOne({
            where: {
                id_course,
                id_group: { [Op.ne]: id_group }
            }
        });

        if (groupCourse) {
            return res.status(400).json({
                ok: false,
                msg: `Ya existe una materia en ese grupo con el id ${id_course}`
            })
        }

        const gro_cou = new Gro_cou({ id_group, id_course, ...resto });
        await gro_cou.save()
        
        res.status(200).json({
            ok: true,
            msg: "La materia se añadio al grupo correctamente"
        })


        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador"
        })
    }



}

const getStudentsFromGroup = async( req, res = response) => {
    const { id_group } = req.params
    try{
        Stu_gro.belongsTo( Student, { foreignKey : 'id_student'})
        Student.hasOne( Stu_gro, { foreignKey : 'id_student'})
        
        Stu_gro.belongsTo( Group, { foreignKey : 'id_group'})
        Group.hasMany( Stu_gro, { foreignKey : 'id_group'})
        
        let studentsGroup = await Stu_gro.findAll({
            include : [{
                model : Student,
                attributes : ['id_student','matricula',[fn('concat',col('name')," ",col('surname_f')," ",col('surname_m')),'student_name']]
            },{
                model : Group,
                attributes : ['id_group','name_group']
            }],
            where : { id_group }
        })

        studentsGroup = studentsGroup.map( studentGro => {
            const {student,groupss,...restoStudentGro} = studentGro.toJSON()
            return {
                ...restoStudentGro,
                ...student,
                ...groupss
            }
        })

        res.json({
            ok : true,
            students : studentsGroup
        })
    }catch( err ){
        printAndSendError( res, err)
    }
}




module.exports = {
    getAllGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    addCourseGroup,
    getStudentsFromGroup
}