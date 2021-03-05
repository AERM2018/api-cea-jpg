const Grades = require("../models/grades")
const { db }  =require('../database/connection');
const { QueryTypes } = require('sequelize');
const { response } = require("express");

const getAllGradesByCourse = async( req, res = response ) => {
    const { id_course } = req.params
    const grades = await db.query(`SELECT cou.course_name AS 'Course', stu.name AS 'Student', gra.grade FROM grades gra LEFT JOIN courses cou ON gra.id_course = cou.id_course LEFT JOIN students stu ON gra.id_student = stu.id_student WHERE gra.id_course = :id`,{replacements : {id: id_course}, type : QueryTypes.SELECT})

    res.status(200).json({
        ok : true,
        grades
    })
}

module.exports = {
    getAllGradesByCourse
}