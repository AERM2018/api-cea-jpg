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
        const { payment_type, id_payment, id_group, major_name, payment_date, start_date,current,  } = pay_info
        let { amount, status_payment, cutoff_date } = pay_info
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
                const { first_day, last_day, overdue } = await getGroupDaysAndOverdue(id_group, start_date)
                const amount_origin = getFeeCourseByMajor(major_name)
                // Change the payment's amount in case it's necessary
                if(status_payment != 1 ){
                    // Change the status if the date is overdue
                    if((status_payment === 0 && moment().month() > moment(cutoff_date).month() && moment().year() >= moment(cutoff_date).year())){
                        if(moment().diff(moment(cutoff_date).endOf('month'),"days") < 15){
                            await Payment.update({ cutoff_date : moment(cutoff_date).endOf('month').add(15,"days") }, {
                                where: { id_payment }
                            })
                            cutoff_date = moment(cutoff_date).endOf('month').add(15,"days")
                        }else{
                            await Payment.update({ status_payment : 2 }, {
                                where: { id_payment }
                            })
                            status_payment = 2
                        }
                    }
                    if((status_payment === 0 && moment().month() === moment(cutoff_date).month()) || (status_payment === 2 && moment().month() != moment(cutoff_date).month())){
                        if (amount_origin + overdue != amount) {
                            await Payment.update({ amount: amount_origin + overdue }, {
                                where: { id_payment }
                            })
                            expected = amount_origin + overdue
                        }
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
                            start_date: { [Op.gte]: start_date },
                            end_date: { [Op.lte]: moment(start_date).endOf('month').format().substr(0,10) },
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
                    course = { name: `Pago adelantado de materia del mes ${moment(start_date).format('MMMM-YYYY')}` }
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