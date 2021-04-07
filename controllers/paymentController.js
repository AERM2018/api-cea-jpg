const { response } = require("express")
const moment = require('moment')
const Student = require("../models/student");
const Gro_cou = require("../models/gro_cou");
const { Op, QueryTypes, col, fn } = require("sequelize");
const Stu_gro = require("../models/stu_gro");
const Stu_pay = require("../models/stu_pay");
const Emp_pay = require("../models/emp_pay");
const Group = require("../models/group");
const Course = require("../models/courses");
const Payment = require("../models/payment");
const Request = require("../models/request");
const Document = require("../models/document");
const { document_types, fee_school, getFeeCourseByMajor } = require("../types/dictionaries");
const { getPaymentStudent } = require("../helpers/getPaymentStudent");
const { db } = require("../database/connection");
const { getInscriptions, getReqPay, getPayInfo } = require("../queries/queries");
const Emp_dep = require("../models/emp_dep");
const Stu_pay_status = require("../models/stu_pay_status");
const Major = require("../models/major");

const getAllPayments = async (req, res = response) => {
    try {
        Group.belongsTo(Major, { foreignKey: 'id_major' })
        Major.hasMany(Group, { foreignKey: 'id_major' })
        const groups = await Group.findAll({
            include: {
                model: Major,
                attributes: ['major_name']
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
            return { id_group, name_group, ...major.toJSON(), money_exp, money }

        })
        Promise.all(pay_group).then(payments_info => {
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

            if (amount < fee_school) {
                return res.status(400).json({
                    ok: false,
                    msg: `El pago por inscripción no se pudo realizar, faltan $${feed_school - amount}, `
                })
            }
            change = amount - fee_school
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

const getAllPaymentsByGroup = async (req, res = response) => {
    const { id_group } = req.params

    const stu_gro = await Stu_gro.findAll({
        where: {
            id_group: id_group
        }
    })

    const payments = stu_gro.map(async ({ id_student }) => {
        const student = await Student.findOne({
            where: { id_student },
            attributes: [[fn('concat', col('name'), ' ', col('surname_f'), ' ', col('surname_m')), 'student_fullname'], 'id_student', 'matricula']
        })
        const stu_pays = await getPaymentStudent(id_student, false)
        return { ...student.toJSON(), ...stu_pays }
    })

    Promise.all(payments).then(stu_pay_info => {
        res.status(200).json({
            ok: true,
            payments: stu_pay_info
        })
    })
}
const deletePayment = async (req, res = response) => {
    const { id_payment } = req.params
    try {
        const payment = await Payment.findOne({
            where: {
                id_payment: id_payment
            }
        })

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

const payForPayment = async (req, res = response) => {
    const { id_payment } = req.params
    const { pay_amount } = req.body
    let change = 0;
    let pay = 0

    try {
        const payment = await Payment.findOne({
            where: {
                id_payment: id_payment
            }
        })
        const { payment_type, amount } = payment.toJSON()
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
                Request.belongsTo(Document, { foreignKey: 'id_document' })
                Document.hasOne(Request, { foreignKey: 'id_document' })
                const requests = await Request.findOne({
                    where: {
                        id_payment: id_payment
                    },
                    include: {
                        model: Document,
                        attributes: [[col('document_type'), 'name'], [col('id_document'), 'id']]
                    },
                    attributes: { exclude: ['id_request', 'id_payment'] }

                })
                const doc_type = requests.toJSON()['document']['name']
                missing = document_types[doc_type]['price'] - amount
                change = (pay_amount > missing) ? pay_amount - missing : 0
                pay = pay_amount - change
                if (amount + pay === document_types[doc_type]['price']) {
                    status_payment = 1

                }
                break;

            case 'Materia':
                missing = feed_course - amount
                change = (pay_amount > missing) ? pay_amount - missing : 0
                pay = pay_amount - change
                if (amount + pay === feed_course) {
                    status_payment = 1
                } else {
                    cutoff_date = moment().startOf('week').add(1, 'week')
                }
            default:
                break;
        }

        payment.update({
            amount: (amount + pay),
            status_payment: status_payment,
            cutoff_date,
            payment_date: moment().toDate()
        })

        return res.status(200).json({
            ok: true,
            msg: "El abono se aplicó con exito.",
            change
        })
    } catch (err) {
        console.log(err)
    }
}
module.exports = {
    getAllPayments,
    createPayment,
    deletePayment,
    payForPayment,
    getAllPaymentsByGroup
}