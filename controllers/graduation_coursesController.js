const { response, request } = require("express");
const { db } = require("../database/connection")
const Teacher = require('../models/teacher');
const Graduation_courses = require("../models/graduation_courses");
const Graduation_section = require("../models/graduation_section");
const { Op, fn, col } = require("sequelize");
const {printAndSendError} = require("../helpers/responsesOfReq");

const getAllGraduationCourses = async (req=request, res = response) => {

    try{
        const graduation_courses = await Graduation_courses.findAll();
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


const createGraduationCourses = async (req, res = responde ) =>{
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
const updateGraduationCourses = async (req, res = responde ) =>{
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
const deleteGraduationCourses = async (req, res = responde ) =>{
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

module.exports = {
    getAllGraduationCourses,
    createGraduationCourses,
    updateGraduationCourses,
    deleteGraduationCourses
}