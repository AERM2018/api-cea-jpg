const { Op, fn, col } = require("sequelize")
const moment = require('moment');

const { document_types, feed_course } = require('../types/dictionaries')
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

const getPaymentStudent = async (id_payment = 0, id_student = '') => {

    const course_pay_s = moment().startOf('month').toJSON().substr(0, 10)
    const course_pay_f = moment().endOf('month').toJSON().substr(0, 10)
    let missing = 0;

    const payment_basic = await Payment.findOne({
        where: {
            id_payment: id_payment
        }
    })
    const { payment_type, amount } = payment_basic.toJSON()

    Stu_gro.belongsTo(Student, { foreignKey: 'id_student', })
    Student.hasMany(Stu_gro, { foreignKey: 'id_student', })
    Stu_gro.belongsTo(Group, { foreignKey: 'id_group' })
    Group.hasMany(Stu_gro, { foreignKey: 'id_group' })
    const stu_gro = await Stu_gro.findOne({
        where: {
            id_student: id_student
        },
        include: [
            {
                model: Student,
                attributes: ['matricula'],

            },
            {
                model: Group,
                attributes: ['id_group', 'name_group'],
            }
        ],
        attributes: { exclude: ['id_group', 'id_stu_gro', 'id_student'] },
    })
    Emp_pay.belongsTo(Employees, { foreignKey: 'id_employee' })
    Employees.hasOne(Emp_pay, { foreignKey: 'id_employee' })
    const emp_pay = await Emp_pay.findOne({
        where: {
            id_payment: id_payment
        },
        include: {
            model: Employees,
            attributes: [[fn('concat', col('name'), ' ', col('surname_f'), ' ', col('surname_m')), 'fullname'], 'id_employee'],
        },
        attributes: { exclude: ['id_emp_pay', 'id_employee', 'id_payment'] }
    })
    let employee
    if (!emp_pay) {
        employee = { warning: 'El pago no ha sido realizado por ningun trabajador' }
    } else {
        employee = { ...emp_pay.toJSON()['employee'] }
    }
    const { id_group } = stu_gro.toJSON()['groupss']
    let extra;
    switch (payment_type) {
        case 'Documento':
            // Pago documento
            Request.belongsTo(Document, { foreignKey: 'id_document' })
            Document.hasOne(Request, { foreignKey: 'id_document' })
            const requests = await Request.findOne({
                where: {
                    id_payment: id_payment
                },
                include: {
                    model: Document,
                    attributes: [[col('document_type'),'name'], [col('id_document'),'id']]
                },
                attributes: { exclude: ['id_request', 'id_payment'] }

            })
            let request_doc = requests.toJSON()['document']
            const doc_type = requests.toJSON()['document']['name']
            request_doc['name'] = document_types[doc_type]['name']
            missing = document_types[doc_type]['price'] - amount
            extra = { ...request_doc}
            break;
        case 'Materia':
            // Pago de materia
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
            missing = feed_course - amount
            extra = {...course }
            break;
    }
    return { ...payment_basic.toJSON(),missing, ...stu_gro.toJSON(), employee, extra }
}

module.exports = {
    getPaymentStudent
}