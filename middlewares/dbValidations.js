const { response } = require('express');
const Campus = require('../models/campus');
const Department = require('../models/department');
const Employees = require('../models/employee');
const Group = require('../models/group');
const Payment = require('../models/payment');
const Student = require('../models/student');

const checkCampusExistence = async( id_campus = 0) => {  
    const campus = await Campus.findOne({
        where : {id_campus}
    })
    if(!campus){
        throw new Error (`El campus con el id ${id_campus} no existe`)
    } 
    
}

const checkStudentExistence = async(  req, res = response, next  ) => {  
    const matricula =  req.body.matricula || req.params.matricula
    const student = await Student.findOne({
        where : {matricula}
    })
    if(!student){
        return res.status(404).json({
            ok : false,
            msg : `El estudiante con matricula ${matricula} no existe`
        })
    }

    req.id_student = student.toJSON()['id_student']
    next();
}

const checkEmployeeExistence = async(  req, res = response, next  ) => {  
    const id_user = req.body.id_user || req.params.id_user
    const employee = await Employees.findOne({
        where : {id_user}
    })
    if(!employee){
        return res.status(404).json({
            ok : false,
            msg : `El trabajador con matricula ${id_user} no existe`
        })
    }

    req.id_employee = employee.toJSON()['id_employee']
    next();
}

const checkDepartmentExistence = async( id_department = 0 ) => {
    const department = await Department.findOne({
        where : {
            id_department : id_department
        }
    });

    if(!department){
        throw new Error (`El departamento con id ${id_department} no existe`)
    }
}

const checkPaymentExistence = async( id_payment = 0 ) => {
    const payment = await Payment.findOne({
        where : {
            id_payment : id_payment
        }
    });

    if(!payment){
        throw new Error (`El pago con id ${id_payment} no existe`)
    }
}

const checkGroupExistence = async( req, res = response, next ) => {
    const { id_group } = req.params
    const group = await Group.findOne({
        where : {
            id_group : id_group
        }
    });

    if(!group){
        return res.status(404).json({
            ok : false,
            msg : `El grupo con id ${id_group} no existe`
        })
    }

    next();
}

module.exports = {
    checkCampusExistence,
    checkStudentExistence,
    checkEmployeeExistence,
    checkDepartmentExistence,
    checkPaymentExistence,
    checkGroupExistence
}