const { response } = require("express");
const Employees = require("../models/employee");
const Student = require("../models/student");

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
module.exports = {
    getIdEmployee,
    getIdStudent
}