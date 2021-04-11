const { response } = require("express")
const moment = require('moment')

const { printAndSendError } = require('../helpers/responsesOfReq')
const Student = require("../models/student");
// const Gro_cou = require("../models/gro_cou");
const { Op, QueryTypes, col, fn } = require("sequelize");
const Stu_gro = require("../models/stu_gro");
const Stu_pay = require("../models/stu_pay");
const Emp_pay = require("../models/emp_pay");
const Group = require("../models/group");
// const Course = require("../models/courses");
const Payment = require("../models/payment");
const Request = require("../models/request");
const Document = require("../models/document");
const { document_types, fee_school, fee_course, getFeeCourseByMajor, getFeeSchoolByMajor } = require("../types/dictionaries");
const { getPaymentStudent } = require("../helpers/getPaymentStudent");
const { db } = require("../database/connection");
const { getReqPay, getStuInfo } = require("../queries/queries");
const Emp_dep = require("../models/emp_dep");
// const Stu_pay_status = require("../models/stu_pay_status");
const Major = require("../models/major");
const Pay_info = require("../models/pay_info");
const Card = require("../models/card_provisional");
const Card_pay = require("../models/card_pay");

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

    try {

        const [student] = await db.query(getStuInfo, { replacements: { id: id_student }, type: QueryTypes.SELECT })
        const { major_name } = student

        if(!enroll && payment_type != 'Inscripción'){
            return res.status(400).json({
                ok : false,
                msg : `Pago denegado, el alumno con matricula ${matricula} no se encuentra inscrito en algun grupo.`
            })
        }

        switch (payment_type) {
            case 'Documento':
                // Verify if the doc_type was sent
                // if (!document_type && !(document_type >= 0 && document_type <= 10)) {
                //     return res.status(400).json({
                //         ok: false,
                //         msg: "El tipo de documento es obligatorio, verifiquelo por favor."
                //     })
                // }
                const doc_info = new Document({ document_type, cost: document_types[document_type]['price'] })
                const doc = await doc_info.save()
                id_document = doc.toJSON()['id_document']
                status_payment = (amount >= document_types[document_type]['price'])
                change = (amount - document_types[document_type]['price'] > 0) ? amount - document_types[document_type]['price'] : 0
                cutoff_date = moment().startOf('month').day(7).add(1, 'month').startOf('month').day(7).toDate()

                break;

            case 'Inscripción':
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

                const fee_school = getFeeSchoolByMajor(major_name)
                if (amount < fee_school) {
                    return res.status(400).json({
                        ok: false,
                        msg: `El pago por inscripción no se pudo realizar, faltan $${fee_school - amount}.`
                    })
                }
                change = amount - fee_school
                cutoff_date = moment().toDate()
                status_payment = 1
                break;

            case 'Materia':
                const fisrt_sunday = moment().startOf('month').day(7).toDate().toJSON().substr(0, 10)
                const last_sunday = moment(fisrt_sunday).add(4, 'weeks').toDate().toJSON().substr(0, 10)

                const pays_courses = await Pay_info.findAll({
                    where: {
                        [Op.and]: {
                            id_student: id_student,
                            payment_type: { [Op.in]: ['Materia', 'Documento'] },
                        }
                    },
                    attributes: { exclude: ['id'] }
                })
                if (pays_courses.filter(({ status_payment }) => status_payment != 1).length > 0) {
                    return res.status(400).json({
                        ok: false,
                        msg: "Pago denegado, existe un(a) documento/materia pendiente de pagar"
                    })
                }
                
                if (pays_courses.filter(({ payment_date, payment_type }) => (payment_type === 'Materia' && payment_date >= fisrt_sunday && payment_date <= last_sunday)).length > 0) {
                    return res.status(400).json({
                        ok: false,
                        msg: "La materia correspondiente al mes ya se encuentra pagada o abonada"
                    })
                }


                const fee_course = getFeeCourseByMajor(major_name)
                if (amount < fee_course) {
                    cutoff_date = moment().startOf('week').add(1, 'week');
                } else {
                    status_payment = 1
                    cutoff_date = moment().toDate()
                }

        }

        
        const new_payment = new Payment({ payment_method , cutoff_date, amount: (amount - change), status_payment,  ...rest})
        const payment = await new_payment.save()
        const { id_payment } = payment.toJSON();
        const stu_pay = new Stu_pay({ id_payment, id_student })
        await stu_pay.save();
        const emp_pay = new Emp_pay({ id_payment, id_employee })
        await emp_pay.save();

        if(id_card){
            const card_pay = new Card_pay({ id_card, id_payment})
            await card_pay.save()
        }

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

        const msg = (!status_payment) ? "Se ha registrado su pago como abono." : `Pago registrado con exito`
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
            const student = await Student.findByPk(id_student,{
                attributes: [[fn('concat', col('name'), ' ', col('surname_f'), ' ', col('surname_m')), 'student_fullname'], 'matricula']
            })
            const stu_pays = await getPaymentStudent(id_student, false)
            return { ...student.toJSON(),id_student, ...stu_pays, missing: (stu_pays.money_exp - stu_pays.money) }
        })
    
        Promise.all(payments).then(stu_pay_info => {
            res.status(200).json({
                ok: true,
                payments: stu_pay_info
            })
        })
    } catch ( err ) {
        printAndSendError(res, err)
    }
}

const getAllPaymentsByStudent = async (req, res = response) => {
    const { id_student } = req
    const { matricula } = req.params
    const { status = null } = req.query
    const st_pay = (status != null) ? {'status_payment' : status} : {}

    const student = await Student.findByPk(id_student,
        { 
            attributes : [[fn('concat',col('name')," ",col('surname_f')," ",col('surname_m')), 'student_fullname']] 
        })
    
    
    try {
        let payments = await getPaymentStudent(id_student, true, st_pay)
        payments = {...payments, matricula, id_student, ...student.toJSON()}

        return res.status(200).json({
            ok: true,
            student: payments
        })
    } catch ( err ) {
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
        console.log(payment_method)
        await Stu_pay.destroy({
            where: { id_payment }
        })
        await Emp_pay.destroy({
            where: { id_payment }
        })
        if (payment_type== 'Documento') {
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

        if(payment_method === 'Tarjeta' || payment_method === 'Depósito'){
            Card_pay.destroy({
                where : {id_payment}
            })
        }
        await payment.destroy()

        res.sendStatus(200)
    } catch (err) {
       printAndSendError(res, err)
    }
}

const payForPayment = async (req, res = response) => {
    const { id_payment } = req.params
    const { pay_amount } = req.body
    let change = 0;
    let pay = 0
    
    
    try {
        const payment = await Pay_info.findOne({
            where: { id_payment },
            attributes: { exclude: ['id'] }
        })
        const { payment_type, amount, major_name } = payment.toJSON()

        // TODO: La fecha de corte puede cambiar
        let { status_payment, cutoff_date } = payment.toJSON()
        // Don't pay a payment which is already paid fully
        if (status_payment) {
            return res.status(400).json({
                ok: false,
                msg: `El pago con id ${id_payment} ya se encuentra liquidado.`,
            })
        }
        switch (payment_type) {
            case 'Documento':
                const req_pay = await db.query(getReqPay, { replacements: { id: id_payment }, type: QueryTypes.SELECT })
                const doc_type = req_pay[0]['name']
                missing = document_types[doc_type]['price'] - amount
                change = (pay_amount > missing) ? pay_amount - missing : 0
                pay = pay_amount - change
                if (amount + pay === document_types[doc_type]['price']) {
                    status_payment = 1
                }
                break;

            case 'Materia':
                missing = getFeeCourseByMajor(major_name) - amount
                change = (pay_amount > missing) ? pay_amount - missing : 0
                pay = pay_amount - change
                if (amount + pay === getFeeCourseByMajor(major_name)) {
                    status_payment = 1
                } else {
                    cutoff_date = moment().startOf('week').add(1, 'week')
                }
            default:
                break;
        }

        await Payment.update({
            amount: (amount + pay),
            status_payment,
            cutoff_date,
            payment_date: moment().toDate()
        }, { where: { id_payment } })

        return res.status(200).json({
            ok: true,
            msg: "El abono se aplicó con exito.",
            change
        })
    } catch (err) {
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
    getPricesPayments
}