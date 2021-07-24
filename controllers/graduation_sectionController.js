const { response } = require("express");
const { db } = require("../database/connection")
const Teacher = require('../models/teacher');
const Graduation_section = require('../models/graduation_section');
const { printAndSendError } = require("../helpers/responsesOfReq");
const Graduation_courses = require("../models/graduation_courses");

const getAllGraduationSections = async (req, res = response) => {

    try{
        const graduation_sections = await Graduation_section.findAll();
        return res.status(200).json({//200 means success
            ok: true,
            graduation_sections
        })
    } catch(err){
        console.log(err);
        return res.status(500).json({//500 error en el servidor
            ok: false,
            msg: 'Hable con el administrador'
        })
       
    }

    // try {
    //     const {id_teacher, name}= req.query
    //     Graduation_section.belongsTo(Graduation_courses,{foreignKey:'id_graduation_course'})
    //     Graduation_courses.hasMany(Graduation_section,{foreignKey: 'id_graduation_course'})

    //     let graduation_courses = await Graduation_courses.findAll({
    //         include: [{model: Graduation_section, attributes: ['id_teacher']}],
    //         //      where: {
    //         //     [Op.or]: [{id_teacher},{'name':{
    //         //         [Op.like]:  [[fn('concat', '%', col('name'), ' ', col('surname_f'), ' ', col('surname_m'), '%')]]
    //         //     }}]
    //         // }
    //     })
    //     if(id_teacher|| name){
    //         graduation_courses = graduation_courses.map(async(graduation_course)=>{
    //             const {id_teacher:id_teacherDb}= graduation_course.graduation_sections
    //             if(id_teacher&&id_teacher==id_teacherDb){
    //                 return graduation_course;
    //             }
    //             console.log(graduation_course.toJSON())
    //             const teacher = await Teacher.findByPk(id_teacher)
    //             const {name:nameDb, surname_f, surname_m}= teacher.toJSON()
    //         if(`${nameDb.toLowerCase()}${surname_f.toLowerCase()}${surname_m.toLowerCase()}`.includes(name.split(' ').join('').toLowerCase())){
    //             return graduation_course;
    //         }

    //         })
    //         graduation_courses= await Promise.all(graduation_courses);
    //     }
    //     return res.status(200).json({
    //         ok: true,
    //         graduation_courses
    //     })
    // } catch (err) {
    //     printAndSendError(res, err)
    // }
}


const getGraduationSectionsById = async (req, res = response) => {
    const {id}= req.params
    try{
        const graduation_section = await Graduation_section.findByPk(id)
        if( !graduation_section ){
            return res.status(404).json({
                ok : false,
                msg : `La sección del curso de graduación con id ${id} no existe, verifiquelo por favor.`
            })
        }
        res.json({
            ok: true,
            graduation_section
        })
    }catch(err){
        printAndSendError(res, err)
    }

}

const createGraduationSections = async (req, res = response ) =>{
    const { body } = req;
    try {
        console.log("test")
        //  Create and save graduation section
        const graduation_section = new Graduation_section(body);
        await graduation_section.save();

        res.status(201).json({
            ok: true,
            msg: 'Sección del curso de graduación creado correctamente'
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }

}
const updateGraduationSections = async (req, res = responde ) =>{
    const { id } = req.params
    const { body } = req;

    try {
        // Check if the record exists before updating
        const graduation_section = await Graduation_section.findByPk(id)
        if (!graduation_section) {
            return res.status(404).json({
                ok : false,
                msg : `La sección del cusro de graduación con id ${id} no existe, verifiquelo por favor.`
            })
        }

        // Update record in the database
        await Graduation_section.update(body, {
            where: { 'id_graduation_section': id }
        })

        
        return res.status(200).json({
            ok : true,
            msg : 'Sección del curso de graduación actualizado correctamente'
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            ok : false,
            msg : 'Hable con el administrador'
        })
    }
    
}
const deleteGraduationSections = async (req, res = responde ) =>{
    const { id } = req.params

    try{
        const graduation_section = await Graduation_section.findByPk( id );
        
        // Check if the state exists
        if( !graduation_section ){
            return res.status(404).json({
                ok : false,
                msg : `Esta sección del curso de graduación con id ${id} no existe, verifiquelo por favor.`
            })
        }
    
        // Delete the record of the graduation section
        await graduation_section.destroy();
    
        
        res.status(200).json({
            ok : true,
            msg : 'Sección del curso de graduación eliminado correctamente'
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
    getAllGraduationSections,
    getGraduationSectionsById,
    createGraduationSections,
    updateGraduationSections,
    deleteGraduationSections
}