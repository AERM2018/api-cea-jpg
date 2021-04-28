const { Op, col, QueryTypes } = require("sequelize")

const { document_types, fee_school, getFeeCourseByMajor, getFeeSchoolByMajor } = require('../types/dictionaries')
const Course = require("../models/courses")
const Gro_cou = require("../models/gro_cou")
const { db } = require("../database/connection");
const { getReqPay } = require('../queries/queries');
const Pay_info = require("../models/pay_info");
const { getFisrtAndLastSunday, getGroupDaysAndOverdue } = require("./dates");
const { printAndSendError } = require('../helpers/responsesOfReq');
const Partial_pay = require("../models/partial_pay");
const { fn } = require("sequelize");

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
        const { payment_type, id_payment, id_group, major_name, status_payment, payment_date, current } = pay_info
        let { amount } = pay_info
        expected = amount
        switch (payment_type) {
            case 'Documento':
                let req_pay = await db.query(getReqPay, { replacements: { id: id_payment }, type: QueryTypes.SELECT })
        
                if (details) {
                    const doc_type = req_pay[0].name
                    req_pay[0].name = document_types[doc_type]['name']
                    const { name } = req_pay[0]
                    extra = { name }
                }
                break;
                case 'Materia':
                    const { first_day, last_day, overdue } = await getGroupDaysAndOverdue(payment_date)
                    const amount_origin = getFeeCourseByMajor( major_name )
                    expected = amount_origin + overdue
                    // Pago de materia
                    Gro_cou.belongsTo(Course, { foreignKey: 'id_course' })
                Course.hasMany(Gro_cou, { foreignKey: 'id_course' })
                const gro_cou = await Gro_cou.findOne({
                    where: {
                        [Op.and]: {
                            start_date: { [Op.gte]: first_day },
                            end_date: { [Op.lte]: last_day },
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
                

        // const [money_current] = await Partial_pay.findAll({
        //     where: { id_payment },
        //     attributes: [[fn('sum', col('amount_p')), 'sum']]
        // })

        // current = money_current.toJSON().sum
       
        extra = { ...extra, id_payment, status_payment, payment_date }
        return (details) ? { expected, current, missing : (expected - current ), ...extra } : { expected, current }
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

    return { money_exp, money, missing: (money_exp - money), payments }



}

module.exports = {
    getPaymentStudent
}