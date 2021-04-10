const { Op, col, QueryTypes } = require("sequelize")

const { document_types, fee_school, getFeeCourseByMajor, getFeeSchoolByMajor } = require('../types/dictionaries')
const Course = require("../models/courses")
const Gro_cou = require("../models/gro_cou")
const { db } = require("../database/connection");
const { getReqPay } = require('../queries/queries');
const Pay_info = require("../models/pay_info");
const { getFisrtAndLastSunday } = require("./dates");

const getPaymentStudent = async (id_student = '', details = false) => {

    let missing = 0;

    try {
        const allPaymentsByStudent = await Pay_info.findAll({
            where: { id_student },
            order: [['payment_date', 'DESC']],
            attributes: { exclude: ['id'] }
        })

        let extra;

        const moneyFromPayments = allPaymentsByStudent.map(async (pay_info) => {
            let expected, current
            const { payment_type, amount, id_payment, id_employee, employee_fullname, id_group, major_name, status_payment, payment_date } = pay_info
            switch (payment_type) {
                case 'Documento':
                    let req_pay = await db.query(getReqPay, { replacements: { id: id_payment }, type: QueryTypes.SELECT })
                    expected = req_pay[0].cost
                    current = amount;

                    if (details) {
                        const doc_type = req_pay[0].name
                        req_pay[0].name = document_types[doc_type]['name']
                        missing = document_types[doc_type]['price'] - pay_info.amount
                        const { name } = req_pay[0]
                        extra = { missing, name }
                    }
                    break;
                case 'Materia':
                    const { fisrt_sunday, last_sunday } = getFisrtAndLastSunday(payment_date)
                        // Pago de materia
                        Gro_cou.belongsTo(Course, { foreignKey: 'id_course' })
                    Course.hasMany(Gro_cou, { foreignKey: 'id_course' })
                    const gro_cou = await Gro_cou.findOne({
                        where: {
                            [Op.and]: {
                                start_date: { [Op.gte]: fisrt_sunday },
                                end_date: { [Op.lte]: last_sunday },
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

                    expected = getFeeCourseByMajor(major_name)
                    current = amount
                    missing = getFeeCourseByMajor(major_name) - amount


                    extra = { ...course, missing }
                    break;

                case 'Inscripción':
                    expected = getFeeSchoolByMajor(major_name)
                    current = amount;
                    missing = getFeeSchoolByMajor(major_name) - amount
                    extra = { name: `Inscripción a ${major_name}`, missing }
            }
            extra = { ...extra, id_employee, employee_fullname, status_payment, payment_date }
            return (details) ? { expected, current, ...extra } : { expected, current }
        })

        const payments = await Promise.all(moneyFromPayments)

        let money_exp = 0, money = 0
        payments.forEach(pay => {
            money_exp += pay.expected
            money += pay.current
        })
        if (!details) {
            return { money_exp, money }
        }
        const { student_fullname, matricula } = allPaymentsByStudent[0].toJSON()
        return { student_fullname, id_student, matricula, money_exp, money, missing: (money_exp - money), payments }
    } catch (err) {
        printAndSendError(res, err)
    }

}

module.exports = {
    getPaymentStudent
}