const { response } = require("express")
const Course = require("../models/courses")
const { db } = require("../database/connection")

const getAllCourses = async (req, res = response) => {

    
    const [courses] = await db.query(
        `SELECT cou.id_course, maj.major_name, cou.course_name FROM courses cou LEFT JOIN majors maj ON cou.id_major = maj.id_major`
    )
    res.status(200).json({
        ok: true,
        courses
    })
}

const createCourse = async (req, res = response) => {

    const { body } = req;

    try {

        // Check if the major exist
        const [course_id] = await sequelize.query(`SELECT * FROM majors WHERE id_major = ${body['id_major']}`)
        if (course_id.length < 1) {
            return res.status(404).json({
                ok: false,
                msg: 'La carrera seleccionada no existe'
            })
        }

        //  Create and save course
        const course = new Course(body);
        await course.save();

        res.status(201).json({
            ok: true,
            msg: 'Curso creado correctamente'
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }

}

const updateCourse = async (req, res = response) => {
    const { id } = req.params
    const { body } = req;

    try {
        // Check if the record exists before updating
        const course = await Course.findByPk(id)
        if (!course) {
            return res.status(404).json({
                ok : false,
                msg : `El curso con id ${id} no existe, verifiquelo por favor.`
            })
        }

        // Update record in the database
        await Course.update(body, {
            where: { 'id_course': id }
        })

        return res.status(200).json({
            ok : true,
            msg : 'Curso actualizado correctamente'
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            ok : false,
            msg : 'Hable con el administrador'
        })
    }
}

const deleteCourse = async( req, res = response) => {
    const { id } = req.params

    try{
        const course = await Course.findByPk( id );
        
        // Check if the course exists
        if( !course ){
            return res.status(404).json({
                ok : false,
                msg : `El curso con id ${id} no existe, verifiquelo por favor.`
            })
        }
    
        // Delete the record of the course
        await course.destroy()
    
        res.status(200).json({
            ok : true,
            msg : 'Curso eliminado correctamente'
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
    getAllCourses,
    createCourse,
    updateCourse,
    deleteCourse
}