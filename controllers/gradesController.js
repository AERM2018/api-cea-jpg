const Grades = require("../models/grades")
const { db } = require('../database/connection');
const { QueryTypes, Op } = require('sequelize');
const { response, request } = require("express");
const Course = require("../models/courses");
const Group = require("../models/group");
const { getGrades } = require("../queries/queries");
const Stu_gro = require("../models/stu_gro");

const getAllGradesByCourse = async (req, res = response) => {
    const { id_course } = req.params
    const { id_group } = req.query

    try {

        // Check if the course exists
        const course = await Course.findByPk(id_course);
        if (!course) {
            return res.status(404).json({
                ok: false,
                msg: `El curso con id ${id_course} no existe, verifiquelo por favor.`
            })
        }
        // Check if the group exists
        const group = await Group.findOne({
            where: { 'id_group': id_group }
        })
        if (!group) {
            return res.status(404).json({
                ok: false,
                msg: `El grupo con id ${id_group} no existe, verifiquelo por favor.`
            })
        }
        const grades = await db.query(getGrades, { replacements: { 'id_course': id_course, 'id_group': id_group }, type: QueryTypes.SELECT });

        res.status(200).json({
            ok: true,
            grades
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador."
        })
    }
}

const uploadGrades = async (req, res = response) => {

    const { id_course } = req.params;
    const { students, id_group } = req.body;

    try {

        // Check if the course exists
        const course = await Course.findByPk(id_course);
        if (!course) {
            return res.status(404).json({
                ok: false,
                msg: `El curso con id ${id_course} no existe, verifiquelo por favor.`
            })
        }

        // Check if the group exists
        const group = await Group.findOne({
            where: { 'id_group': id_group }
        })
        if (!group) {
            return res.status(404).json({
                ok: false,
                msg: `El grupo con id ${id_group} no existe, verifiquelo por favor.`
            })
        }

        // get ids' of the students which belong to the group
        const stu_gro = await Stu_gro.findAll({
            where: { 'id_group': id_group }
        })
        const idstudents_group = stu_gro.map(e => e['id_student'])

        // Check if there are grades for the course already to avoid duplicates
        const gradesCourse = await Grades.findAll({
            where: {
                'id_course': id_course,
                'id_student': { [Op.in]: idstudents_group }
            }
        })

        if (gradesCourse.length > 0) {
            return res.status(500).json({
                ok: false,
                msg: `No se ha podido cargar las calificaciones para el grupo con id ${id_group} debido a que ya existen. Si desea modificarlas, actualize las calificaciones`
            })
        }

        // Check if all the students given belong to the group given

        let except = [];
        students.forEach(({ id_student }) => {
            if (!idstudents_group.includes(id_student)) {
                except.push(id_student)
            }
        })
        if (except.length > 0) {
            return res.status(404).json({
                ok: false,
                msg: `No se ha podido subir caliicaciones debido a id(s) no registrados con el grupo con id ${id_group} `,
                "id´s": except
            })
        }

        // iterate array to get every student and create his grade voiding dupliactes
        students.forEach(async ({ id_student, grade }) => {
            try {
                const studentGrade = new Grades({ id_course, id_student, grade })
                await studentGrade.save();

            } catch (err) {
                console.log(`Ya existe una calificación para el alumno con id ${id_student}, no se registró para evitar un duplicado`)

            }

        });
        res.status(200).json({
            ok: true,
            msg: "Calificaciones cargadas correctamente.",
            except
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador."
        })
    }
}

const updateGrades = async (req, res = response) => {
    const { id_course } = req.params;
    const { students, id_group } = req.body;

    try {
        // check if the course exists
        const course = await Course.findByPk(id_course);
        if (!course) {
            return res.status(404).json({
                ok: false,
                msg: `El curso con id ${id_course} no existe, verifiquelo por favor.`
            })
        }

        // check if the group exists
        const group = await Group.findOne({
            where: { 'id_group': id_group }
        })
        if (!group) {
            return res.status(404).json({
                ok: false,
                msg: `El grupo con id ${id_group} no existe, verifiquelo por favor.`
            })
        }

        // get ids' of the students which belong to the group
        const stu_gro = await Stu_gro.findAll({
            where: { 'id_group': id_group }
        })

        const idstudents_group = stu_gro.map(e => e['id_student'])
        let except = [];
        students.forEach(({ id_student }) => {
            if (!idstudents_group.includes(id_student)) {
                except.push(id_student)
            }
        })

        if (except.length > 0) {
            return res.status(404).json({
                ok: false,
                msg: `No se ha podido actualizar calificaciones debido a id(s) no registrados con el grupo con id ${id_group} `,
                "id´s": except
            })
        }

        // iterate array to get every student and modify his grade
        students.forEach(async ({ id_student, grade }) => {
            await Grades.update({ grade }, { where: { 'id_student': id_student } })
        });

        res.status(200).json({
            ok: true,
            msg: "Calificaciones actualizadas correctamente."
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            ok: false,
            msg: "Hable con el administrador."
        })
    }
}

const deleteGradeByStudentId = async (req, res = response) => {
    const { id_course } = req.params;
    const { id_student } = req.body;

    try {
        // Check if the course exists
        const course = await Course.findByPk(id_course);
        if (!course) {
            return res.status(404).json({
                ok: false,
                msg: `El curso con id ${id_student} no existe, verifiquelo por favor.`
            })
        }

        //check if the student has the grade which wants to be deleted
        const grade = await Grades.findOne({
            where: {
                'id_course': id_course,
                'id_student': id_student,
            }
        })
        if (!grade) {
            return res.status(404).json({
                ok: false,
                msg: `El estudiante con id ${id_student} no cuenta con una calificación para el curso con id ${id_course}, verifiquelo por favor.`
            })
        }

        await grade.destroy();

        res.status(200).json({
            ok: true,
            msg: `Calificación del estudiante con id ${id_student} eliminada correctamente`
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            ok: false,
            msg: "Hable con el administrador."
        })
    }
}

module.exports = {
    getAllGradesByCourse,
    uploadGrades,
    updateGrades,
    deleteGradeByStudentId
}