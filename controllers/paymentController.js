const { response } = require("express")
const moment = require('moment')

const { printAndSendError } = require('../helpers/responsesOfReq')
const Student = require("../models/student");
const { Op, QueryTypes, col, fn } = require("sequelize");
const Stu_gro = require("../models/stu_gro");
const Stu_pay = require("../models/stu_pay");
const Emp_pay = require("../models/emp_pay");
const Group = require("../models/group");
const Payment = require("../models/payment");
const Request = require("../models/request");
const Document = require("../models/document");
const { document_types, fee_school, fee_course, getFeeCourseByMajor, getFeeSchoolByMajor } = require("../types/dictionaries");
const { getPaymentStudent } = require("../helpers/getPaymentStudent");
const { db } = require("../database/connection");
const { getReqPay, getStuInfo } = require("../queries/queries");
const Emp_dep = require("../models/emp_dep");
const Major = require("../models/major");
const Pay_info = require("../models/pay_info");
const Card = require("../models/card");
const Card_pay = require("../models/card_pay");
const Emp_par_pay = require("../models/emp_pay");
const Partial_pay = require("../models/partial_pay");
const { getGroupDaysAndOverdue } = require("../helpers/dates");

const getAllPayments = async (req, res = response) => {
    const { major_name = '', name_group = '' } = req.query
    try {
        Group.belongsTo(Major, { foreignKey: 'id_major' })
        Major.hasMany(Group, { foreignKey: 'id_major' })
        const groups = await Group.findAll({
            include: {
                model: Major,
                attributes: ['major_name'],
                where: {
                    'major_name': { [Op.like]: `${major_name}%` }
                }
            },
            where: {
                'name_group': { [Op.like]: `%${name_group}%` }
            }

        });

        const pay_group = groups.map(async ({ id_group, name_group, major }) => {
            const stu_gro = await Stu_gro.findAll({
                where: {
                    id_group: id_group
                }
            })

            const payments = stu_gro.map(async ({ id_student }) => await getPaymentStudent(id_student, false))

            const gro_pay_info = await Promise.all(payments)

            let money_exp = 0, money = 0
            gro_pay_info.forEach(pay_info => {
                if (!pay_info.money_exp && !pay_info.money) return
                money_exp += pay_info.money_exp
                money += pay_info.money


            })
            return { id_group, name_group, ...major.toJSON(), money_exp, money, missing: (money_exp - money) }

        })
        Promise.all(pay_group).then(payments_info => {
            res.status(200).json({
                ok: true,
                payments: payments_info
            })
        })

    } catch (err) {
        printAndSendError(res, err)
    }

}

const getPricesPayments = (req, res = response) => {

    const prices = {
        fee_school,
        fee_course,
        document_types
    }
    return res.status(200).json({
        ok: true,
        ...prices
    })
}
const createPayment = async (req, res = response) => {
    const { matricula, id_user, document_type, payment_method, id_card, amount, ...rest } = req.body
    const { id_employee, id_student, enroll } = req;
    let status_payment = false;
    let cutoff_date;
    let id_document;
    const { payment_type } = rest
    let change = 0;
    let total_to_pay = 0

    try {

        const [student] = await db.query(getStuInfo, { replacements: { id: id_student }, type: QueryTypes.SELECT })
        const { major_name, id_group } = student

        if (!enroll && payment_type.toLowerCase() != 'inscripción') {
            return res.status(400).json({
                ok: false,
                msg: `Pago denegado, el alumno con matricula ${matricula} no se encuentra inscrito en algun grupo.`
            })
        }

        switch (payment_type.toLowerCase()) {
            case 'documento':
                // Verify if the doc_type was sent
                total_to_pay = document_types[document_type]['price']
                const doc_info = new Document({ document_type, cost: total_to_pay })
                const doc = await doc_info.save()
                id_document = doc.toJSON()['id_document']
                status_payment = (amount >= total_to_pay)

                cutoff_date = moment().local().endOf('month').format().substr(0,10)

                break;

            case 'inscripción':
                const pays_ins = await Pay_info.findAndCountAll({
                    where: {
                        id_student: id_student,
                        payment_type: 'Inscripción'
                    },
                    attributes: { exclude: ['id'] }
                })
                if (pays_ins.count != 0) {
                    return res.status(400).json({
                        ok: false,
                        msg: `El alumno con matricula ${matricula} ya esta inscrito a un grupo`
                    })
                }

                total_to_pay = getFeeSchoolByMajor(major_name)
                if (amount < total_to_pay) {
                    return res.status(400).json({
                        ok: false,
                        msg: `El pago por inscripción no se pudo realizar, faltan $${total_to_pay - amount}.`
                    })
                }
                cutoff_date = moment().local().format().substr(0,10)
                status_payment = 1
                break;

            case 'materia':

                
                const pays_courses = await Pay_info.findAll({
                    where: {
                        [Op.and]: {
                            id_student: id_student,
                            payment_type: { [Op.in]: ['Materia', 'Documento'] },
                        }
                    },
                    attributes: { exclude: ['id'] }
                })
                const { first_day, last_day,  overdue } = await getGroupDaysAndOverdue(id_group)
                if (pays_courses.filter(({ status_payment }) => status_payment != 1).length > 0) {
                    return res.status(400).json({
                        ok: false,
                        msg: "Pago denegado, existe un(a) documento/materia pendiente de pagar."
                    })
                }

                if (pays_courses.filter(({ payment_date, payment_type }) => (payment_type === 'Materia' && payment_date >= first_day && payment_date <= last_day)).length > 0) {
                    return res.status(400).json({
                        ok: false,
                        msg: "La materia correspondiente al mes ya se encuentra pagada o abonada."
                    })
                }

                total_to_pay = getFeeCourseByMajor(major_name) + overdue
                if (amount < total_to_pay) {
                    cutoff_date = moment().local().day(moment(first_day).local().day() + 7 ).format().substr(0,10)
                    if(moment(cutoff_date).month() != moment(first_day).month()){
                        cutoff_date = moment().local().endOf('month').format().substr(0,10)
                    }
                    
                } else {
                    status_payment = 1
                    cutoff_date = moment().local().format().substr(0,10)
                }

        }

        const payment_date = (status_payment) ? moment().local().format().substr(0,10) : null
        change = (amount - total_to_pay > 0) ? amount - total_to_pay : 0
        const new_payment = new Payment({ cutoff_date, payment_date, amount: total_to_pay, status_payment, ...rest })
        const payment = await new_payment.save()
        const { id_payment } = payment.toJSON();
        const stu_pay = new Stu_pay({ id_payment, id_student })
        await stu_pay.save();

        const partial_pay = new Partial_pay({ id_payment, id_card, amount_p: (amount - change), payment_method, date_p: moment().local().format().substr(0,10) })
        const par_pay_saved = await partial_pay.save()
        const { id_partial_pay } = par_pay_saved
        const emp_par_pay = new Emp_par_pay({ id_partial_pay, id_employee })
        await emp_par_pay.save();

        // create a new request just in case a document was created
        if (id_document) {
            const emp_dep = await Emp_dep.findOne({
                where: {
                    id_employee: id_employee
                }
            })
            const { id_department } = emp_dep.toJSON()
            const request = new Request({ id_department, id_document, id_payment })
            await request.save()
        }

        const msg = (!status_payment) ? "Se ha registrado su pago como abono." : `Pago registrado con exito.`
        return res.status(201).json({
            ok: true,
            msg,
            change
        })
    } catch (err) {
        printAndSendError(res, err)
    }
}

const getAllPaymentsByGroup = async (req, res = response) => {
    const { id_group } = req.params

    try {

        const stu_gro = await Stu_gro.findAll({
            where: { id_group }
        })

        const payments = stu_gro.map(async ({ id_student }) => {
            const student = await Student.findByPk(id_student, {
                attributes: [[fn('concat', col('name'), ' ', col('surname_f'), ' ', col('surname_m')), 'student_fullname'], 'matricula']
            })
            const stu_pays = await getPaymentStudent(id_student, false)
            return { ...student.toJSON(), id_student, ...stu_pays, missing: (stu_pays.money_exp - stu_pays.money) }
        })

        Promise.all(payments).then(stu_pay_info => {
            res.status(200).json({
                ok: true,
                student_payments: stu_pay_info
            })
        })
    } catch (err) {
        printAndSendError(res, err)
    }
}

const getAllPaymentsByStudent = async (req, res = response) => {
    const { id_student } = req
    const { matricula } = req.params
    const { status = null } = req.query
    const st_pay = (status != null) ? { 'status_payment': status } : {}

    const student = await Student.findByPk(id_student,
        {
            attributes: [[fn('concat', col('name'), " ", col('surname_f'), " ", col('surname_m')), 'student_fullname']]
        })


    try {
        let payments = await getPaymentStudent(id_student, true, st_pay)
        payments = { ...payments, matricula, id_student, ...student.toJSON() }

        return res.status(200).json({
            ok: true,
            student: payments
        })
    } catch (err) {
        printAndSendError(res, err)
    }
}

const deletePayment = async (req, res = response) => {
    const { id_payment } = req.params
    try {
        const payment = await Payment.findOne({
            where: { id_payment }
        })

        const { payment_type, payment_method } = payment.toJSON()
        await Stu_pay.destroy({
            where: { id_payment }
        })


        const partial_pays = await Partial_pay.findAll({
            where: { id_payment }
        })

        const delete_partials = partial_pays.map(async (partial_pay) => {
            const { id_partial_pay } = partial_pay;
            await Emp_par_pay.destroy({
                where: { id_partial_pay }
            })

            partial_pay.destroy()
        })

        await Promise.all(delete_partials)

        if (payment_type == 'Documento') {
            const request = await Request.findOne({
                where: { id_payment }
            })
            await request.destroy()
            await Document.destroy({
                where: {
                    id_document: request.toJSON()['id_document']
                }
            })

        }

        await payment.destroy()

        return res.status(200).json({
            ok : true,
            msg : `Pago eliminado corectamente`
        })
    } catch (err) {
        printAndSendError(res, err)
    }
}

const payForPayment = async (req, res = response) => {
    const { id_payment } = req.params
    const { pay_amount, payment_method, id_card } = req.body
    let change = 0;
    let pay = 0
    let new_status, new_cutoff_date


    try {
        const payment = await Pay_info.findOne({
            where: { id_payment },
            attributes: { exclude: ['id'] }
        })
        const { payment_type, amount, current, status_payment, cutoff_date, id_group, major_name } = payment.toJSON()
        const { first_day } = await getGroupDaysAndOverdue( id_group )
        
        // Don't pay a payment which is already paid fully
        if (status_payment) {
            return res.status(400).json({
                ok: false,
                msg: `El pago con id ${id_payment} ya se encuentra liquidado.`,
            })
        }

        if( moment().local().isAfter( moment( cutoff_date )) && moment().local().month() != moment(cutoff_date).month()){
            return res.status(400).json({
                ok: false,
                msg: `La fecha de corte del pago con id ${id_payment} expiró.`,
            })
        }
        missing = amount - current
        change = (pay_amount > missing) ? pay_amount - missing : 0
        pay = pay_amount - change
        switch (payment_type) {
            case 'Documento':
                if (current + pay === amount) {
                    new_status = 1
                }
                break;

            case 'Materia':
                if (current + pay === amount) {
                    new_status = 1
                } else {
                    new_cutoff_date = moment().local().day(moment(first_day).day() +  7).format().substr(0,10)
                    if(moment(new_cutoff_date).month() != moment(first_day).month()){
                        new_cutoff_date = moment().local().endOf('month').format().substr(0,10)
                    }
                }
            default:
                break;
        }

        
        if (status_payment != new_status || cutoff_date != new_cutoff_date) {
            const payment_date = (new_status) ? moment().local().format().substr(0,10) : null
            await Payment.update({
                status_payment: new_status,
                cutoff_date: new_cutoff_date,
                payment_date
            }, { where: { id_payment } })
        }
        const partial_pay = new Partial_pay({ id_payment, id_card, amount_p: pay, payment_method, date_p: moment().local().format().substr(0,10) })
        await partial_pay.save()

        return res.status(200).json({
            ok: true,
            msg: "El abono se aplicó con exito.",
            change
        })
    } catch (err) {
        printAndSendError(res, err)
    }
}

const updatePayment = async( req, res = response) => {
    const { cutoff_date } = req.body
    const { id_payment } = req.params

    try {
        const payment = await Payment.findOne({
            where : { id_payment }
        })
        const { status_payment, payment_type, cutoff_date : cutoff_date_origin } = payment.toJSON()
        if(status_payment){
            return res.status(400).json({
                ok : false,
                msg : `Cambio de fecha de corte denegado, el pago ya se encuentra liquidado.`
            })
        }
        if( payment_type === 'Materia' && moment(cutoff_date).month() > moment(cutoff_date_origin).month()){
            return res.status(400).json({
                ok : false,
                msg : `Cambio de fecha corte denegado, la fecha de corte de un pago de materia no se puede cambiar`
            })
        }
        await payment.update({cutoff_date})
    
        return res.status(200).json({
            ok : true,
            msg : "Fecha de corte actualizada correctamente"
        })
    } catch ( err ) {
        printAndSendError(res, err)
    }
}
module.exports = {
    getAllPayments,
    createPayment,
    deletePayment,
    payForPayment,
    getAllPaymentsByGroup,
    getAllPaymentsByStudent,
    getPricesPayments,
    updatePayment
}