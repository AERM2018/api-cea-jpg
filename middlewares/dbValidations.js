const { response } = require('express');
const Campus = require('../models/campus');
const Card = require('../models/card');
const Department = require('../models/department');
const Employees = require('../models/employee');
const Group = require('../models/group');
const Payment = require('../models/payment');
const Pay_info = require('../models/pay_info');
const Student = require('../models/student');
const { document_types } = require('../types/dictionaries');

const checkCampusExistence = async (id_campus = 0) => {
    const campus = await Campus.findOne({
        where: { id_campus }
    })
    if (!campus) {
        throw new Error(`El campus con el id ${id_campus} no existe`)
    }

}

    const checkStudentExistence = async (req, res = response, next) => {
        const matricula = req.body.matricula || req.params.matricula
        const student = await Student.findOne({
            where: { matricula }
        })
        if (!student) {
            return res.status(404).json({
                ok: false,
                msg: `El estudiante con matricula ${matricula} no existe`
            })
        }

        req.id_student = student.toJSON()['id_student']
        next();
    }




        
const checkStudentEnroll = async (req, res = respone, next) => {
    const { id_student } = req;
    const enroll_payments = await Pay_info.findAndCountAll({
        where: {
            id_student,
            payment_type: 'Inscripción'
        },
        attributes: { exclude: ['id'] }
    })
    req.enroll = (enroll_payments.count > 0) ? true : false
    // console.log(req.enroll)

    next()
}

const checkEmployeeExistence = async (req, res = response, next) => {
    const id_user = req.body.id_user || req.params.id_user
    const employee = await Employees.findOne({
        where: { id_user }
    })
    if (!employee) {
        return res.status(404).json({
            ok: false,
            msg: `El trabajador con id ${id_user} no existe`
        })
    }

    req.id_employee = employee.toJSON()['id_employee']
    next();
}

const checkDepartmentExistence = async (req, res = response, next) => {
    const id_department = req.params.id_department || req.body.id_department
    const department = await Department.findOne({
        where: {
            id_department: id_department
        }
    });

    if (!department) {
        return res.status(404).json({
            ok: false,
            msg: `El departamento con id ${id_department} no existe`
        })
    }

    next()
}

const checkPaymentExistence = async (req, res = response, next) => {
    const id_payment = req.params.id_payment || req.body.id_payment
    const payment = await Payment.findOne({
        where: {
            id_payment: id_payment
        }
    });

    if (!payment) {
        return res.status(404).json({
            ok: false,
            msg: `El pago con id ${id_payment} no existe`
        })
    }

    next()
}

const checkGroupExistence = async (req, res = response, next) => {
    const { id_group } = req.params
    const group = await Group.findOne({
        where: { id_group }
    });

    if (!group) {
        return res.status(404).json({
            ok: false,
            msg: `El grupo con id ${id_group} no existe`
        })
    }

    next();
}

// Checar que el id de card venga en el req cuando sea necesario
const isValidCard = async (id_card = null, req) => {
    const { payment_method } = req.body
    if ((payment_method.toLowerCase() === 'tarjeta' || payment_method.toLowerCase() === 'depósito')) {
        if (!id_card) throw Error(`La tarjeta a la cual va dirigo el pago es obligatoria.`)
    } else {
        if (id_card || id_card === 0) throw Error(`La tarjeta a la cual va dirigo el pago no es requerida.`)
    }

    return true
}

const checkCardExistence = async (req, res = response, next) => {
    const { id_card } = req.body
    if (id_card != null) {
        const card = await Card.findByPk(id_card);
        if (!card) {
            return res.status(404).json({
                ok: false,
                msg: `La tarjeta con id ${id_card} no existe.`
            })
        }
    }

    next()
}



// Checar que el document_type venga en el req cuando sea necesario
const isValidDocument = (document_type = null, req) => {
    const { payment_type } = req.body
    if (payment_type.toLowerCase() != 'documento') {
        if (document_type || document_type === 0) throw Error(`El tipo de documento no es requerido.`)
    } else {
        if (document_type === null) throw Error(`El tipo de documento es obligatorio.`)
        if (document_type < 0 || document_type >= document_types.length) throw Error(`Tipo de documento invalido`)
    }
    return true
}

const isValidPaymentMethod = ( payment_method= ' ' ) => {
    if(!['tarjeta','depósito','efectivo'].includes(payment_method.toLowerCase())){
        throw Error('Métdodo de pago invalido.')
    }else{
        return true
    }
}
const isValidPaymentType = ( payment_type = ' ' ) => {
    if(!['documento','inscripción','materia'].includes(payment_type.toLowerCase())){
        throw Error('Tipo de pago invalido.')
    }else{
        return true
    }
}

const isValidStartDate = ( start_date ) => {
    if(start_date != null){
        if(start_date < 0 || start_date > 11) throw new Error('Start date inválido')
    }

    return true
}
const isValidEduLevel = ( edu_level ) => {
        if(![1,2].includes(edu_level)) throw new Error('Nivel de eduación inválido')

    return true
}
module.exports = {
    checkCampusExistence,
    checkStudentExistence,
    checkEmployeeExistence,
    checkDepartmentExistence,
    checkPaymentExistence,
    checkGroupExistence,
    checkStudentEnroll,
    isValidCard,
    checkCardExistence,
    isValidDocument,
    isValidPaymentMethod,
    isValidPaymentType,
    isValidStartDate,
    isValidEduLevel
}