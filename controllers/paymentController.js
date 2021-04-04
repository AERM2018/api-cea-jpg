const { response } = require("express")
const Student = require("../models/student");
const moment = require('moment');
const Gro_cou = require("../models/gro_cou");
const { Op } = require("sequelize");
const Stu_gro = require("../models/stu_gro");
const Stu_pay = require("../models/stu_pay");
const Emp_pay = require("../models/emp_pay");
const Group = require("../models/group");
const Course = require("../models/courses");
const Payment = require("../models/payment");
const Request = require("../models/request");
const Document = require("../models/document");
const { document_types } = require("../types/dictionaries");

const getAllPayments = async (req, res = response) => {
    try {
        const course_pay_s = moment().startOf('month').toJSON().substr(0, 10)
        const course_pay_f = moment().endOf('month').toJSON().substr(0, 10)

        const stu_payments = await Stu_pay.findAll();
        const stu_gro = stu_payments.map(async ({ id_payment, id_student }) => {

            const payment_basic = await Payment.findOne({
                where: {
                    id_payment: id_payment
                }
            })
            const {payment_type} = payment_basic.toJSON()

            Stu_gro.belongsTo(Student, { foreignKey: 'id_student', })
            Student.hasMany(Stu_gro, { foreignKey: 'id_student', })
            Stu_gro.belongsTo(Group, { foreignKey: 'id_group'})
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

                attributes: ['id_group'],
            })

            let extra;
            switch (payment_type) {
                case 'Documento':
                    Request.belongsTo(Document, { foreignKey : 'id_document'})
                    Document.hasOne(Request, { foreignKey : 'id_document'})
                    const requests = await  Request.findOne({
                        where : {
                            id_payment : id_payment
                        },
                        include : {
                            model : Document,
                            attributes : ['document_type']
                        },
                        attributes : { exclude : ['id_request', 'id_payment']}
                        
                    })
                    let request_doc = requests.toJSON()
                    const doc_type = requests.toJSON()['document']['document_type']
                    request_doc['document']['document_type'] = document_types[doc_type]['name']
                    extra = request_doc
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
                                id_group: stu_gro.toJSON()['id_group']
                            }
                        },
                        include: {
                            model: Course,
                            attributes: ['id_course', 'course_name']
                        },
                        attributes: { exclude: ['id_gro_cou', 'id_course', 'id_group', 'start_date', 'end_date', 'status'] }

                    })
                    extra = gro_cou
                    break;
                    
                    default:
                        break;
                        
                    }
                    const { id_group, ...rest_stu_gro } = stu_gro.toJSON()
                    return { ...payment_basic.toJSON(), ...rest_stu_gro, extra }
                    



        })

        Promise.all(stu_gro).then(payments_info => {
            res.status(200).json({
                ok: true,
                payments: payments_info
            })
        })






    } catch (err) {
        console.log(err)
        res.status(500).json({
            ok: false,
            msg: "Hable con el administrador"
        })
    }
}


const createPayment = async (req, res = response) => {
    const { matricula, id_user, id_employee, id_student, ...rest } = req.body
    let cutoff_date;
    if (rest.status_payment === 1) {
        cutoff_date = moment().toDate()
    }

    // console.log(rest)

    const new_payment = new Payment({ ...rest, cutoff_date })
    const payment = await new_payment.save()
    const { id_payment } = payment.toJSON();
    const stu_pay = new Stu_pay({ id_payment, id_student })
    await stu_pay.save();
    const emp_pay = new Emp_pay({ id_payment, id_employee })
    await emp_pay.save();


    return res.status(201).json({
        ok: true,
        msg: "Pago registrado con exito"
    })
    // const id_student = await Student.findOne({
    //     attributes : ['id_student'],
    //     where: { matricula },
    // })
    // const id_group = await Stu_gro.findOne({
    //     attributes : ['id_group'],
    //     where : {id_student : id_student.toJSON()['id_student']},
    // })
    // const gro_cou = await Gro_cou.findOne({
    //     where: {
    //         [Op.and]: {
    //             start_date: { [Op.gte]: course_pay_s },
    //             end_date: { [Op.lte]: course_pay_f },
    //             id_group : id_group.toJSON()['id_group']
    //         }
    //     },
    //     attributes : ['id_course']
    // })

    // return res.json({
    //     gro_cou
    // })
    // try {
    //     const student = await Student.findOne({
    //         where : {matricula}
    //     })
    //     const {id_student} = student.toJSON()
    //     const payments = await Payments.findAll();
    //     res.status(200).json({
    //         ok :true,
    //         payments
    //     })
    // } catch ( err ) {
    //     console.log(err)
    //     res.status(500).json({
    //         ok :false,
    //         msg : "Hable con el administrador"
    //     })
    // }
}

module.exports = {
    getAllPayments,
    createPayment
}