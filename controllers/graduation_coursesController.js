const { response, request } = require("express");
const { db } = require("../database/connection")
const Teacher = require('../models/teacher');
const Graduation_courses = require("../models/graduation_courses");
const Graduation_section = require("../models/graduation_section");
const { Op, fn, col } = require("sequelize");
const {printAndSendError} = require("../helpers/responsesOfReq");
const Stu_gracou = require("../models/stu_gracou");
const Student = require("../models/student");
const { setSectionInactivate, setCourseInactivate } = require("../helpers/courses");

const getAllGraduationCourses = async (req=request, res = response) => {
    let {courseGradName = '',status='all'} = req.query;
    let statusCondition = (status=='all') ? {} : {status}
    Graduation_section.belongsTo(Graduation_courses, {foreignKey : 'id_graduation_course'})
    Graduation_courses.hasMany(Graduation_section, {foreignKey : 'id_graduation_course'})
    Graduation_section.belongsTo(Teacher, {foreignKey : 'id_teacher'})
    Teacher.hasOne(Graduation_section, {foreignKey : 'id_teacher'})
    Graduation_courses.belongsTo(Teacher,{foreignKey:'id_teacher'})
    Teacher.hasOne(Graduation_courses,{foreignKey:'id_teacher'})
    try{
        let graduation_courses = await Graduation_courses.findAll({
            where: {[Object.keys(req.query).every( key => ['courseGradName','status'].includes(key))?Op.and:Op.or]:[
                {course_grad_name: {[Op.like]: `%${courseGradName}%`}},
                statusCondition
            ]},
            include : [{
                model : Graduation_section,
                attributes :{ exclude : [ 'id_graduation_course']},
                required : false,
                include : {
                  model : Teacher,
                  attributes : ['id_teacher',[fn('concat',col('graduation_sections.teacher.name'),' ',col('graduation_sections.teacher.surname_f'),' ',col('graduation_sections.teacher.surname_m')),'teacher_name']]
                }
              },
              {
                model : Teacher,
                attributes : ['id_teacher',[fn('concat',col('teacher.name'),' ',col('teacher.surname_f'),' ',col('teacher.surname_m')),'teacher_name']]
            }]
        });
        graduation_courses = await Promise.all( graduation_courses.map( async(course) => {
            let {teacher,...coursesInfoJSON} = course.toJSON()
            coursesInfoJSON.graduation_sections = await Promise.all( course.graduation_sections.map(async(section) => {
                section = await setSectionInactivate(section)
                const {teacher,...sectionInfo}=section.toJSON()
                return {...sectionInfo,...teacher}
            }))
            coursesInfoJSON.graduation_sections = coursesInfoJSON.graduation_sections.filter(section => section)
            course = await setCourseInactivate(course)
            if(!course.status && status==1) return
            coursesInfoJSON.teacher_name = teacher.teacher_name
            return coursesInfoJSON
        }))
        graduation_courses = graduation_courses.filter( graduation_course => graduation_course)
        return res.status(200).json({//200 means success
            ok: true,
            graduation_courses
        })
    } catch(err){
        console.log(err);
        return res.status(500).json({//500 error en el servidor
            ok: false,
            msg: 'Hable con el administrador'
        })
       
    }

}

const createGraduationCourses = async (req, res = response ) =>{
    const { sections = [],...restGraduationCourse } = req.body;
    try {
        const graduation_course = new Graduation_courses(restGraduationCourse)
        const {id_graduation_course} = await graduation_course.save();
        while(sections.length > 0){
            let graduation_section = new Graduation_section({...sections[0],id_graduation_course})
            await graduation_section.save()
            sections.pop()
        }
        res.status(201).json({
            ok: true,
            msg: 'Curso de graduación creado correctamente'
        })
    } catch (err) {
        printAndSendError(res,err)
    }
}

const updateGraduationCourses = async (req, res = response ) =>{
    const { id_graduation_course } = req.params
    const { body } = req;

    try {
        // Check if the record exists before updating
        const graduation_course = await Graduation_courses.findByPk(id_graduation_course)
        // Update record in the database
        await Graduation_courses.update(body, {
            where: { id_graduation_course }
        })
        return res.status(200).json({
            ok : true,
            msg : 'El curso de graduación ha sido actualizado correctamente'
        })
    } catch (err) {
        printAndSendError(res,err)
    }
    
}

const deleteGraduationCourses = async (req, res = response ) =>{
    //TODO: Revisar si es baja física o lógica
    const {id_graduation_course}= req.params;
    try{
        await Graduation_section.destroy({where:{id_graduation_course}})
        await Graduation_courses.destroy({where:{id_graduation_course}});
        res.status(200).json({
            ok: true,
            msg: "El curso de graduación se eliminó correctamente"
        })
    }catch(error){
        console.log(error)
        return res.status(500).json({
            ok:false,
            msg: "Hable con el administrador"
        })
    }
}

const getStudentsFromGradCourse = async(req, res) => {
    const {id_graduation_course} = req.params
    try {
        Stu_gracou.belongsTo(Graduation_courses, { foreignKey : 'id_graduation_course' })
        Graduation_courses.hasMany(Stu_gracou, { foreignKey : 'id_graduation_course' })

        Stu_gracou.belongsTo(Student, { foreignKey : 'id_student' })
        Student.hasOne(Stu_gracou, { foreignKey : 'id_student' })

        let studentsGradCou = await Stu_gracou.findAll({
            include : [{
                model : Graduation_courses,
                attributes : ['id_graduation_course','course_grad_name']
            },{
                model : Student,
                attributes : ['id_student','matricula',[fn('concat',col('name')," ",col('surname_f')," ",col('surname_m')),'student_name']]
            }],
            where : {id_graduation_course}
        })

        studentsGradCou = studentsGradCou.map( studentGradCou => {
            const {graduation_course,student,...restoStudentGradCou} = studentGradCou.toJSON();
            return {
                ...restoStudentGradCou,
                ...graduation_course,
                ...student
            }
        })
        res.json({
            ok : true,
            students : studentsGradCou
        });
    } catch ( err ) {
        printAndSendError(res, err)
    }
}
module.exports = {
    getAllGraduationCourses,
    createGraduationCourses,
    updateGraduationCourses,
    deleteGraduationCourses,
    getStudentsFromGradCourse
}