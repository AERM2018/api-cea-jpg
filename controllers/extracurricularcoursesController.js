const { response, request } = require("express");
const { db } = require("../database/connection")
const Teacher = require('../models/teacher');
const Graduation_courses = require("../models/graduation_courses");
const Graduation_section = require("../models/graduation_section");
const { Op, fn, col } = require("sequelize");
const {printAndSendError} = require("../helpers/responsesOfReq");
const ExtraCurricularCourses = require("../models/extracurricularcourses");

const getAllExtraCurricularCourses = async (req=request, res = response) => {
    let {teacherName}= req.query;

    ExtraCurricularCourses.belongsTo(Teacher, {foreignKey: 'id_teacher'})
    Teacher.hasMany(ExtraCurricularCourses,{foreignKey:'id_teacher'})

    try{

        if(teacherName==undefined){
            teacherName='';
        }
        const extraCurricularCourses = await ExtraCurricularCourses.findAll({
            include: {model:Teacher,
            where: {[Op.or]:[{
                name: {[Op.like]: `%${teacherName}%`}
            }, {surname_f: {[Op.like]: `%${teacherName}%`}}, {surname_m: {[Op.like]: `%${teacherName}%`}}
            ]} }
        });
        return res.status(200).json({//200 means success
            ok: true,
            extraCurricularCourses
        })
    } catch(err){
        console.log(err);
        return res.status(500).json({//500 error en el servidor
            ok: false,
            msg: 'Hable con el administrador'
        })
       
    }

}


const createExtraCurricularCourse = async (req, res = responde ) =>{
    const { body } = req;
    try {
        
        const extracurricular_course = new ExtraCurricularCourses(body)
        await extracurricular_course.save();

        res.status(201).json({
            ok: true,
            msg: 'Curso extra curricular creado correctamente'
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }

}
const updateExtraCurricularCourse = async (req, res = responde ) =>{

    const { id_ext_cou } = req.params
    const { body } = req;

    try {
        // Check if the record exists before updating
        const extracurricular_course = await ExtraCurricularCourses.findByPk(id_ext_cou)
        if (!extracurricular_course) {
            return res.status(404).json({
                ok : false,
                msg : `El curso extra curricular con id ${id_ext_cou} no existe, verifíquelo por favor.`
            })
        }

        // Update record in the database
        await ExtraCurricularCourses.update(body, {
            where: { 'id_ext_cou': id_ext_cou }
        })
        return res.status(200).json({
            ok : true,
            msg : 'Curso extra curricular actualizado correctamente'
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            ok : false,
            msg : 'Hable con el administrador'
        })
    }
    
}
const deleteExtraCurricularCourse = async (req, res = responde ) =>{
    const { id_ext_cou } = req.params

    try{
        const extracurricular_course = await ExtraCurricularCourses.findByPk(id_ext_cou );
        
        // Check if the state exists
        if( !extracurricular_course ){
            return res.status(404).json({
                ok : false,
                msg : `El curso extra curricular con id ${id_ext_cou} no existe, verifíquelo por favor.`
            })
        }
    
        // Delete the record of the graduation section
        await extracurricular_course.destroy();
    
        
        res.status(200).json({
            ok : true,
            msg : 'Curso extra curricular eliminado correctamente'
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
    getAllExtraCurricularCourses,
    createExtraCurricularCourse,
    updateExtraCurricularCourse,
    deleteExtraCurricularCourse
}