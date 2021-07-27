const { response } = require("express");
const Employees = require("../models/employee");
const Student = require("../models/student");
const Teacher = require("../models/teacher");

const getIdEmployee = async (req, res = response, next) => {
    try {
        const { id_user } = req.body
        const employee = await Employees.findOne({
            where: { id_user }
        })
        req.body.id_employee =  employee.toJSON()['id_employee'];
        next();
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador"
        })
    }
}

const getIdStudent = async (req, res = response, next) => {
    const { matricula } = req.body
    try {
        const student = await Student.findOne({
            where: { matricula }
        })
        req.body.id_student = student.toJSON()['id_student'];
        next();
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador"
        })
    }
}

const getIdTeacher = async (req, res = response, next) => {
    const  id_user  = req.body.id_user || req.params.id_user
    try {
        const teacher = await Teacher.findOne({
            where: { id_user }
        })
        req.body.id_teacher = student.toJSON()['id_student'];
        next();
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador"
        })
    }
}
module.exports = {
    getIdEmployee,
    getIdStudent,
    getIdTeacher
}