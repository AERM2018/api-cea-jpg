const { Op, fn, col, QueryTypes } = require("sequelize")
const moment = require('moment');

const { document_types, feed_course, getFeeCourseByMajor } = require('../types/dictionaries')
const Course = require("../models/courses")
const Document = require("../models/document")
const Group = require("../models/group")
const Gro_cou = require("../models/gro_cou")
const Payment = require("../models/payment")
const Request = require("../models/request")
const Student = require("../models/student")
const Stu_gro = require("../models/stu_gro");
const Emp_pay = require("../models/emp_pay");
const Employees = require("../models/employee");
const { sequelize } = require("../models/student");
const { db } = require("../database/connection");
const { getPayInfo, getReqPay } = require('../queries/queries')

const getPaymentStudent = async (id_student = '', details = false) => {

    const course_pay_s = moment().startOf('month').toJSON().substr(0, 10)
    const course_pay_f = moment().endOf('month').toJSON().substr(0, 10)
    let missing = 0;

    const allPaymentsByStudent = await db.query(getPayInfo, { replacements: { id: id_student }, type: QueryTypes.SELECT })

    let extra;

    const moneyFromPayments = allPaymentsByStudent.map(async (pay_info) => {
        let expected, current
        const { payment_type, amount, id_payment, id_employee, employee_fullname, id_group, major_name, status_payment} = pay_info
        switch (payment_type) {
            case 'Documento':
                // Pago documento
                // Request.belongsTo(Document, { foreignKey: 'id_document' })
                // Document.hasOne(Request, { foreignKey: 'id_document' })
                // const requests = await Request.findOne({
                //     where: {
                //         id_payment: id_payment
                //     },
                //     include: {
                //         model: Document,
                //         attributes: [[col('document_type'),'name'], [col('id_document'),'id']]
                //     },
                //     attributes: { exclude: ['id_request', 'id_payment'] }

                // })
                let req_pay = await db.query(getReqPay, { replacements: { id: id_payment }, type: QueryTypes.SELECT })
                expected = req_pay[0].cost
                current = amount;

                if (details) {
                    const doc_type = req_pay[0].name
                    req_pay[0].name = document_types[doc_type]['name']
                    missing_payment = document_types[doc_type]['price'] - pay_info.amount
                    // const { id_student, student_fullname,  } = pay_info
                    extra = { missing_payment, id_employee, employee_fullname, status_payment,...req_pay[0] }
                }
                break;
            case 'Materia':
                // Pago de materia
                // const { id_group, major_name,amount } = pay_info
                Gro_cou.belongsTo(Course, { foreignKey: 'id_course' })
                Course.hasMany(Gro_cou, { foreignKey: 'id_course' })
                const gro_cou = await Gro_cou.findOne({
                    where: {
                        [Op.and]: {
                            start_date: { [Op.gte]: course_pay_s },
                            end_date: { [Op.lte]: course_pay_f },
                            id_group
                        }
                    },
                    include: {
                        model: Course,
                        attributes: [[col('id_course'), 'id'], [col('course_name'),'name']]
                    },
                    attributes: { exclude: ['id_gro_cou', 'id_course', 'id_group', 'start_date', 'end_date', 'status'] }

                })

                let course
                if (!gro_cou) {
                    course = { warning: 'No existe una materia registrada para la fecha del pago' }
                } else {
                    course = { ...gro_cou.toJSON()['course'] }
                }

                expected = getFeeCourseByMajor( major_name )
                current = amount
                missing = getFeeCourseByMajor( major_name ) - amount


                extra = {...course, id_employee, employee_fullname, status_payment }
                break;

            case 'Inscripción':
                expected = getFeeCourseByMajor(major_name)
                current = amount;
                extra = { name : 'Inscripción', id_employee, employee_fullname, status_payment}
        }
        return (details) ? { expected, current, ...extra } : { expected, current }
    })

    const payments = await Promise.all(moneyFromPayments)

    let money_exp = 0, money = 0
    if(!details){
        payments.forEach(pay => {
            // if (!pay.expected && !pay.current) return
            money_exp += pay.expected
            money += pay.current
        })

        return { money_exp, money, missing: (money_exp - money) }
    }

    return payments
}

module.exports = {
    getPaymentStudent
}