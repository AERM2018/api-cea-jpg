const Campus = require('../models/campus');
const Department = require('../models/department');
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

const checkStudentExistence = async(  matricula = '' ) => {  
    const student = await Student.findOne({
        where : {matricula}
    })
    if(!student){
        throw new Error (`Un estudiante la matricula ${matricula} no existe`)
    }
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

module.exports = {
    checkCampusExistence,
    checkStudentExistence,
    checkDepartmentExistence,
    checkPaymentExistence
}