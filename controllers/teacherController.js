const User = require('../models/user');
const Teacher = require('../models/teacher');
//const Cou_tea = require('../models/cou_tea');
const bcrypt = require('bcryptjs');
const Cam_use = require('../models/cam_use');
const Campus = require('../models/campus');
const { Op, QueryTypes,fn, col, literal, where } = require('sequelize');
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
const Graduation_section = require('../models/graduation_section');
const Major = require('../models/major');
const Educational_level = require('../models/educational_level');
const Graduation_courses = require('../models/graduation_courses');
const { getRegularCourseInfo, getExtraCourseInfo, setCourseInactivate, setSectionInactivate } = require('../helpers/courses');

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
    const {courseName = '',status='all'} = req.query
    const statusCondition = (status == 'all')  ? {} : {status}
    try{
        // Regular courses
        Cou_tea.belongsTo( Course, { foreignKey : 'id_course'})
        Course.hasOne( Cou_tea, { foreignKey : 'id_course'})
        let coursesTeacherGiven =  await Cou_tea.findAll({
            include : {
                model : Course,
                attributes : ['course_name'],
                where : {course_name:{[Op.like]:`%${courseName}%`}}
            },
            attributes : ['id_course','status','start_date','end_date'],
            where : { id_teacher },

        })
        coursesTeacherGiven = coursesTeacherGiven.map( async(course) => {
            const { id_course,start_date,end_date, ...restoCourse} = course.toJSON()
            const gro_cou = await Gro_cou.findOne({
                where : {
                    id_course,
                    start_date,
                    end_date,
                    ...statusCondition
                }
            })
            if(!gro_cou) return
            let courseData = await getRegularCourseInfo({id_gro_cou:gro_cou.id_gro_cou})
            courseData.type='regular'
            return courseData
        })
        coursesTeacherGiven = await Promise.all(coursesTeacherGiven)
        coursesTeacherGiven = coursesTeacherGiven.filter( course => course )
        // Extracurricular courses
        let extCoursesTeacherGiven = await ExtraCurricularCourses.findAll({
            where : { id_teacher, ext_cou_name:{[Op.like]:`%${courseName}%`},...statusCondition }, attributes : ['id_ext_cou'],
            raw : true,
            nest : true
        })

        extCoursesTeacherGiven = await Promise.all(extCoursesTeacherGiven.map( async({id_ext_cou}) => {
            const extraCourseInfo = await getExtraCourseInfo({id_ext_cou})
            return {id_ext_cou,...extraCourseInfo,type:'extra'}
        }))
        // // Graduation courses
        Graduation_section.belongsTo(Graduation_courses, {foreignKey : 'id_graduation_course'})
        Graduation_courses.hasMany(Graduation_section, {foreignKey : 'id_graduation_course'})
        Graduation_courses.hasMany(Graduation_section, {foreignKey : 'id_graduation_course'})
        Graduation_courses.belongsTo(Teacher,{foreignKey:'id_teacher'})
        Teacher.hasOne(Graduation_courses,{foreignKey:'id_teacher'})
        let gradCoursesTeacherGiven = await Graduation_courses.findAll({
            include : [{
                model : Graduation_section,
                attributes :{ exclude : [ 'id_teacher','id_graduation_course']},
                where :{  id_teacher, ...(statusCondition=={})&&{in_progress:statusCondition.status} },
                required : false
            },
            {
                model : Teacher,
                attributes : ['id_teacher',[fn('concat',col('name'),' ',col('surname_f'),' ',col('surname_m')),'teacher_name']]
            }],
            where : where(literal(`(((SELECT COUNT(id_graduation_section) FROM graduation_sections WHERE id_teacher = '${id_teacher}' AND ${col('id_graduation_course').col == col('id_graduation_course')}) > 0) or (graduation_courses.id_teacher = '${id_teacher}') AND ${col('course_grad_name').col} LIKE '%${courseName}%' ${(status!='all')?` AND status = ${status}`:''})`),true)
        })
        gradCoursesTeacherGiven = await Promise.all( gradCoursesTeacherGiven.map( async(course) => {
            let {teacher,...coursesInfoJSON} = course.toJSON()
            coursesInfoJSON.graduation_sections = await Promise.all( course.graduation_sections.map(async(section) => {
                section = await setSectionInactivate(section)
                if(status!='all' && !section.in_progress) return
                return section
            }))
            coursesInfoJSON.graduation_sections = coursesInfoJSON.graduation_sections.filter(section => section)
            course = await setCourseInactivate(course)
            if(!course.status) return
            coursesInfoJSON.teacher_name = teacher.teacher_name
            coursesInfoJSON.isTeacherTitular = (coursesInfoJSON.id_teacher == id_teacher) ? 1 : 0
            coursesInfoJSON.type = 'graduation_course'
            return coursesInfoJSON
        }))
        gradCoursesTeacherGiven = gradCoursesTeacherGiven.filter( graduation_course => graduation_course)
        res.json({
            ok : true,
            courses:[...coursesTeacherGiven,...extCoursesTeacherGiven,...gradCoursesTeacherGiven]
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