const User = require('../models/user');
const Teacher = require('../models/teacher');
//const Cou_tea = require('../models/cou_tea');
const bcrypt = require('bcryptjs');
const Cam_use = require('../models/cam_use');
const Campus = require('../models/campus');
const { Op, QueryTypes } = require('sequelize');
const {db} = require('../database/connection');
const { getTeachers } = require('../queries/queries');
const { primaryKeyAttributes } = require('../models/user');
const generateMatricula = require('../helpers/generateMatricula');
const Cou_tea = require('../models/cou_tea');
const Gro_cou = require('../models/gro_cou');
const Group = require('../models/group');
const { printAndSendError } = require('../helpers/responsesOfReq');
const Course = require('../models/courses');
const ExtraCurricularCourses = require('../models/extracurricularcourses');

const getAllTeachers = async (req, res) => {
    const teachers = await db.query(getTeachers, { type : QueryTypes.SELECT})
    
    // const teachers = await Teacher.findAll({
    //     where: { 'active': 1 }
    // });
    
    return res.status(200).json({
        ok: true,
        teachers
    })

}

const createTeacher = async (req, res) => {
    const { body } = req;
    const { name, surname_f,surname_m, rfc, mobile_number, email, id_campus } = body;
    let id_user, id_teacher, user
    try {

        const teacher = await Teacher.findOne({
            where: { rfc }
        });
        if (teacher) {

            //aqui hacer cosas

            return res.status(400).json({
                ok: false,
                msg: "Ya existe un maestro con ese rfc",
            })
        }
        const campus = await Campus.findOne({
            where: { id_campus }
        })
        if (!campus) {
            return res.status(400).json({
                ok: false,
                msg: "No existe un campus con ese id " + id_campus,
            })
        }

        
            const usern = new User({ user_type: "teacher", password: "123456" });
            const newUser = await usern.save()
            const userJson = newUser.toJSON();
            id_user = userJson['id_user']
        


    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador",
        })
    }
    try {
        id_teacher = generateMatricula(id_user)
        const teacher = new Teacher({ id_teacher, id_user, name, surname_f,surname_m, rfc, mobile_number });
        const newTeacher = await teacher.save();
        const newTeacherJson = newTeacher.toJSON();
        id_teacher = newTeacherJson['id_teacher']
        // create password
        user = await User.findByPk(id_user);
        const salt = bcrypt.genSaltSync();
        const pass = bcrypt.hashSync(id_teacher, salt)

        await user.update({ password: pass });

        const inst_email = `${id_teacher}@alejandria.edu.mx`
        await user.update({email : inst_email})
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador",
        })
    }
    // try {
    //     id_courses.forEach(async id_course => {
    //         const cou_tea= new Cou_tea({id_course, id_teacher, status, start_date ,end_date})
    //         await cou_tea.save();
    //     });

    // } catch (error) {
    //     console.log(error)
    //     return res.status(500).json({
    //         ok : false,
    //         msg: "Hable con el administrador",
    //     })
    // }

    try {
        //campus
        const cam_use = new Cam_use({ id_campus, id_user });
        await cam_use.save();


    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador",
        })
    }

    res.status(201).json({
        ok: true,
        msg: "Maestro creado correctamente",
        id_teacher
    })




}
const updateTeacher = async (req, res) => {
    const { id } = req.params;
    const { body } = req;
    const { rfc } = body

    try {
        const teacher = await Teacher.findByPk(id);
        if (!teacher) {
            return res.status(404).json({
                ok: false,
                msg: "No existe un maestro con el id " + id,
            });
        }

        const teacherRfc = await Teacher.findOne({
            where: {
                rfc,
                id_teacher: { [Op.ne]: id }
            }
        });

        if (teacherRfc) {
            return res.status(400).json({
                ok: false,
                msg: `Ya existe un maestro con el RFC ${rfc}`
            })
        }

        await teacher.update(body)
        res.status(200).json({
            ok: true,
            msg: "El maestro se actualizo correctamente"
        })


    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador"
        })
    }
}
const deleteTeacher = async (req, res) => {
    const { id } = req.params;
    const {active}=req.body;
    try {
        const teacher = await Teacher.findOne({
            where: { id_teacher: id }
        });
        if (!teacher) {
            return res.status(404).json({
                msg: "No existe un maestro con el id " + id,
            });
        }
       
        if (teacher.active===2 || teacher.active===3) {
            return res.status(404).json({
                ok: false,
                msg: "No existe un maestro con el id " + id,
            });
        }

        await teacher.update({ active })


        res.status(200).json({
            ok: true,
            msg: "El maestro se elimino correctamente"
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador"
        })
    }


}

const getAllCoursesTeacherGiven = async( req, res = response) => {
    const { id_teacher } = req.params

    try{

        // Regular courses
        Cou_tea.belongsTo( Course, { foreignKey : 'id_course'})
        Course.hasOne( Cou_tea, { foreignKey : 'id_course'})
        let coursesTeacherGiven =  await Cou_tea.findAll({
            include : {
                model : Course,
                attributes : ['course_name'],
            },
            attributes : ['id_course','status','start_date','end_date'],
            where : { id_teacher },

        })
        coursesTeacherGiven = coursesTeacherGiven.map( async(course) => {
            const { id_course, course:courseInfo, ...restoCourse} = course.toJSON()

            Gro_cou.belongsTo( Group, { foreignKey : 'id_group'})
            Group.hasOne( Gro_cou, { foreignKey : 'id_group'})
            const groupTookCourse = await Gro_cou.findOne({
                include : {
                    model : Group,
                    attributes : { include: ['name_group','id_group'], exclude : ['id_course']}
                },
                where : { id_course }
            })


            return {
                ...{id:id_course,...restoCourse,course:courseInfo.course_name},
                ...groupTookCourse.toJSON().groupss,
                type : 'regular'
            }
        })

        coursesTeacherGiven = await Promise.all(coursesTeacherGiven)


        // Extracurricular courses
        let extCoursesTeacherGiven = await ExtraCurricularCourses.findAll({
            where : { id_teacher }, attributes : { exclude : ['id_teacher']}
        })

        extCoursesTeacherGiven = extCoursesTeacherGiven.map( extCou => {
            // {...extCou.toJSON(),type : 'extra'}
            const {id_ext_cou, ...restoExtCou} = extCou.toJSON()
            return {id:id_ext_cou,...restoExtCou,type:'extra'}
        })

        res.json({
            ok : true,
            courses : [...coursesTeacherGiven, ...extCoursesTeacherGiven]
        })
    }catch( err ){
        printAndSendError( res, err )
    }
}




module.exports = {
    getAllTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    getAllCoursesTeacherGiven
}