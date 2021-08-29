const { response, request } = require("express");
const { db } = require("../database/connection")
const Teacher = require('../models/teacher');
const Graduation_courses = require("../models/graduation_courses");
const Graduation_section = require("../models/graduation_section");
const { Op, fn, col } = require("sequelize");
const {printAndSendError} = require("../helpers/responsesOfReq");
const Stu_gracou = require("../models/stu_gracou");
const Student = require("../models/student");

const getAllGraduationCourses = async (req=request, res = response) => {
    let {courseGradName} = req.query;

    try{
        if(courseGradName==undefined){
            courseGradName='';
        }
        const graduation_courses = await Graduation_courses.findAll({
            where: {[Op.or]:[{
                course_grad_name: {[Op.like]: `%${courseGradName}%`}
            }]}
        });
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
    const { body } = req;
    try {
        
        const graduation_course = new Graduation_courses(body)
        await graduation_course.save();

        res.status(201).json({
            ok: true,
            msg: 'Curso de graduación creado correctamente'
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }

}
const updateGraduationCourses = async (req, res = response ) =>{
    const { id } = req.params
    const { body } = req;

    try {
        // Check if the record exists before updating
        const graduation_course = await Graduation_courses.findByPk(id)
        if (!graduation_course) {
            return res.status(404).json({
                ok : false,
                msg : `El curso de graduación con id ${id} no existe, verifíquelo por favor.`
            })
        }

        // Update record in the database
        await Graduation_courses.update(body, {
            where: { 'id_graduation_course': id }
        })
        return res.status(200).json({
            ok : true,
            msg : 'El curso de graduación ha sido actualizado correctamente'
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            ok : false,
            msg : 'Hable con el administrador'
        })
    }
    
}
const deleteGraduationCourses = async (req, res = response ) =>{
    //TODO: Revisar si es baja física o lógica

    const {id}= req.params;
    const {body}=req;

    try{
        const graduation_course= await Graduation_courses.findOne({
            where: { id_graduation_course:id }
        });
        if(!graduation_course){
            return res.status(404).json({
                ok:false,
                msg: "No existe un curso de graduación el id " +id,
            });
        }
        await graduation_course.destroy();
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