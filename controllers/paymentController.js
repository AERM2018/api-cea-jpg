const { response } = require("express")
const moment = require('moment')
const Student = require("../models/student");
const Gro_cou = require("../models/gro_cou");
const { Op, QueryTypes } = require("sequelize");
const Stu_gro = require("../models/stu_gro");
const Stu_pay = require("../models/stu_pay");
const Emp_pay = require("../models/emp_pay");
const Group = require("../models/group");
const Course = require("../models/courses");
const Payment = require("../models/payment");
const Request = require("../models/request");
const Document = require("../models/document");
const { document_types, feed_school, feed_course } = require("../types/dictionaries");
const { getPaymentStudent } = require("../helpers/getPaymentStudent");
const { db } = require("../database/connection");
const { getInscriptions } = require("../queries/queries");
const Emp_dep = require("../models/emp_dep");
const Stu_pay_status = require("../models/stu_pay_status");

const getAllPayments = async (req, res = response) => {
    try {


        const stu_payments = await Stu_pay.findAll();
        const stu_gro = stu_payments.map(async ({ id_payment, id_student }) => {
            const payments = await getPaymentStudent(id_payment, id_student)
            return payments
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
    const { matricula, id_user, id_employee, id_student, document_type, ...rest } = req.body
    let status_payment = false;
    let cutoff_date;
    let id_document;
    const { payment_type, amount } = rest
    let change = 0;

    const emp_dep = await Emp_dep.findOne({
        where: {
            id_employee: id_employee
        }
    })
    const { id_department } = emp_dep.toJSON()

    switch (payment_type) {
        case 'Documento':
            // Verify if the doc_type was sent
            if (!document_type && !(document_type >= 0 && document_type <= 10)) {
                return res.status(400).json({
                    ok: false,
                    msg: "El tipo de documento es obligatorio, verifiquelo por favor."
                })
            }
            const doc_info = new Document({ document_type, cost: document_types[document_type]['price'] })
            const doc = await doc_info.save()
            id_document = doc.toJSON()['id_document']

            status_payment = (amount >= document_types[document_type]['price'])

            cutoff_date = moment().startOf('month').day(7).add(1, 'month').startOf('month').day(7).toDate()

            break;

        case 'Inscripción':
            // const stu_inscripcion = await db.query(getInscriptions, { replacements: { id: id_student }, type: QueryTypes.SELECT })
            const stu_pay_status_ins = await Stu_pay_status.findAndCountAll({
                where: {
                    id_student: id_student,
                    payment_type: 'Inscripción'
                },
                attributes: { exclude: ['id'] }
            })
            if (stu_pay_status_ins.count != 0) {
                return res.status(400).json({
                    ok: false,
                    msg: `El alumno con matricula ${matricula} ya esta inscrito a un grupo`
                })
            }

            if (amount < feed_school) {
                return res.status(400).json({
                    ok: false,
                    msg: `El pago por inscripción no se pudo realizar, faltan $${feed_school - amount}, `
                })
            }
            change = amount - feed_school
            cutoff_date = moment().toDate()
            status_payment = 1
            break;

        case 'Materia':
            const stu_pay_status_cou = await Stu_pay_status.findAndCountAll({
                where: {
                    [Op.and]: {
                        id_student: id_student,
                        payment_date: {
                            [Op.and]: {
                                [Op.gte]: moment().startOf('month').day(7).toDate(),
                                [Op.lte]: moment().endOf('month').day(7).toDate()
                            }
                        },
                        payment_type: 'Materia'
                    }
                },
                attributes: { exclude: ['id'] }
            })
            if (stu_pay_status_cou.count > 0) {
                return res.status(400).json({
                    ok: false,
                    msg: "La materia correspondiente al mes ya se encuentra pagada"
                })
            }

            const stu_pay_status_missing = await Stu_pay_status.findAndCountAll({
                where: {
                    [Op.and]: {
                        id_student: id_student,
                        [Op.or]: {

                            payment_type: 'Materia',
                            payment_type: 'Documento'

                        },
                        status_payment: 0
                    }
                },
                attributes: { exclude: ['id'] }
            })
            if (stu_pay_status_missing.count > 0) {
                return res.status(400).json({
                    ok: false,
                    msg: "Pago denegado, existe un(a) materia/documento pendiente de pagar"
                })
            }

            if (amount < feed_course) {
                cutoff_date = moment().startOf('week').add(1, 'week');
            } else {
                status_payment = 1
                cutoff_date = moment().toDate()
            }

    }
    // console.log(moment('2021-04-26').diff(moment().startOf('month').day(7),'days')/7)
    const new_payment = new Payment({ ...rest, cutoff_date, amount: (amount - change), status_payment })
    const payment = await new_payment.save()
    const { id_payment } = payment.toJSON();
    const stu_pay = new Stu_pay({ id_payment, id_student })
    await stu_pay.save();
    const emp_pay = new Emp_pay({ id_payment, id_employee })
    await emp_pay.save();

    // create a new request just in case a document was created
    if (id_document) {
        const request = new Request({
            id_department,
            id_document,
            id_payment
        })

        await request.save()
    }

    return res.status(201).json({
        ok: true,
        msg: "Pago registrado con exito",
        change
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

const deletePayment = async (req, res = response) => {
    const { id_payment } = req.params
    try {
        const payment = await Payment.findOne({
            where: {
                id_payment: id_payment
            }
        })
        if (!payment) {
            return res.status(404).json({
                ok: false,
                msg: `El pago con id ${id_payment} no existe.`
            });
        }
        await Stu_pay.destroy({
            where: {
                id_payment: id_payment
            }
        })
        await Emp_pay.destroy({
            where: {
                id_payment: id_payment
            }
        })
        if (payment.toJSON()['payment_type'] == 'Documento') {
            const request = await Request.findOne({
                where: {
                    id_payment: id_payment
                }
            })
            await request.destroy()
            await Document.destroy({
                where: {
                    id_document: await request.toJSON()['id_document']
                }
            })

        }
        await payment.destroy()

        res.sendStatus(200)
    } catch (err) {
        console.log(err)
    }
}
module.exports = {
    getAllPayments,
    createPayment,
    deletePayment
}