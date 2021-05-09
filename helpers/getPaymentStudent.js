const { Op, col, QueryTypes } = require("sequelize")
const moment = require('moment');
const { document_types, fee_school, getFeeCourseByMajor, getFeeSchoolByMajor } = require('../types/dictionaries')
const Course = require("../models/courses")
const Gro_cou = require("../models/gro_cou")
const { db } = require("../database/connection");
const { getReqPay } = require('../queries/queries');
const Pay_info = require("../models/pay_info");
const { getGroupDaysAndOverdue } = require("./dates");
const Payment = require("../models/payment");

const getPaymentStudent = async (id_student = '', details = false, st_payment = {}) => {

    let missing = 0;

    const allPaymentsByStudent = await Pay_info.findAll({
        where: { id_student, ...st_payment },
        order: [['payment_date', 'desc']],
        attributes: { exclude: ['id'] }
    })

    let extra;

    const moneyFromPayments = allPaymentsByStudent.map(async (pay_info) => {
        let expected
        const { payment_type, id_payment, id_group, major_name, status_payment, payment_date, current, cutoff_date } = pay_info
        let { amount } = pay_info
        expected = amount
        switch (payment_type) {
            case 'Documento':
                let req_pay = await db.query(getReqPay, { replacements: { id: id_payment }, type: QueryTypes.SELECT })
                if (details) {
                    // Find the name of the document that is related with the payment
                    const doc_type = req_pay[0].name
                    req_pay[0].name = document_types[doc_type]['name']
                    const { name } = req_pay[0]
                    extra = { name }
                }
                break;
            case 'Materia':
                const { first_day, last_day, overdue } = await getGroupDaysAndOverdue(id_group)
                const amount_origin = getFeeCourseByMajor(major_name)
                // Change the payment's amount in case it's necessary
                if(!status_payment && (moment().month() === moment(cutoff_date).month())){
                    if (amount_origin + overdue != amount) {
                        await Payment.update({ amount: amount_origin + overdue }, {
                            where: { id_payment }
                        })
                        expected = amount_origin + overdue
                    }
                }else {
                    expected = amount
                }
                // Get the course's name which the student's taking now
                Gro_cou.belongsTo(Course, { foreignKey: 'id_course' })
                Course.hasMany(Gro_cou, { foreignKey: 'id_course' })
                const gro_cou = await Gro_cou.findOne({
                    where: {
                        [Op.and]: {
                            start_date: { [Op.gte]: moment(cutoff_date).startOf('month').format().substr(0,10) },
                            end_date: { [Op.lte]: moment(cutoff_date).endOf('month').format().substr(0,10) },
                            id_group
                        }
                    },
                    include: {
                        model: Course,
                        attributes: [[col('id_course'), 'id'], [col('course_name'), 'name']]
                    },
                    attributes: { exclude: ['id_gro_cou', 'id_course', 'id_group', 'start_date', 'end_date', 'status'] }

                })

                let course
                if (!gro_cou) {
                    course = { warning: 'No existe una materia registrada para la fecha del pago' }
                } else {
                    course = { ...gro_cou.toJSON()['course'] }
                }

                extra = { ...course }
                break;

            case 'Inscripción':
                extra = { name: `Inscripción a ${major_name}` }
                break;
        }

        extra = { ...extra, id_payment, status_payment, payment_date }
        return (details) ? { expected, current, missing: (expected - current), ...extra } : { expected, current }
    })

    const payments = await Promise.all(moneyFromPayments)

    // Get the total money of the payments
    let money_exp = 0, money = 0
    payments.forEach(pay => {
        money_exp += pay.expected
        money += pay.current
    })
    if (!details) {
        return { money_exp, money }
    }

    return { money_exp, money, missing: (money_exp - money), payments }

}

module.exports = {
    getPaymentStudent
}