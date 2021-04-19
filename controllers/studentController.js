const moment = require('moment')
const User = require('../models/user');
const Student = require('../models/student');
const bcrypt = require('bcryptjs');
const Group = require('../models/group');
const Stu_gro = require('../models/stu_gro');
const Cam_use = require('../models/cam_use');
const Campus = require('../models/campus');
const { Op, QueryTypes, EmptyResultError } = require('sequelize');
const { db } = require('../database/connection');
const { getStudents, getStuInfo } = require('../queries/queries');
const generateMatricula = require('../helpers/generateMatricula');
const Stu_pay_status = require('../models/stu_pay_status');
const { response } = require('express');
const Major = require('../models/major');
const Course = require('../models/courses');
const { getFisrtAndLastSunday } = require('../helpers/dates');
const Gro_cou = require('../models/gro_cou');
const { getFeeCourseByMajor, document_types, getFeeSchoolByMajor } = require('../types/dictionaries');
const { printAndSendError } = require('../helpers/responsesOfReq');


const getAllStudents = async (req, res) => {
    try {
        const students = await db.query(getStudents, { type: QueryTypes.SELECT })
        // const stu_pay = students.map( async (stu) => {
        //     console.log(moment().startOf('month').day(7))
        //     const payment = await Stu_pay_status.findAll({
        //         where : {
        //             id_student : stu.id_student,
        //             [Op.and] :[ 
        //                 {
        //                     payment_date : { [Op.gte] : moment().startOf('month').day(7).toDate()} 
        //                 }
        //                 ,{
        //                 payment_date : { [Op.lte] : moment().endOf('month').day(7).toDate()} ,
        //                 }
        //             ],
        //             status_payment : 0,
        //             payment_type : 'Materia'
        //         },
        //         attributes : { exclude : ['id']}
        //     })
        //     return {...stu,payment}
        // })

        return res.status(200).json({
            ok: true,
            students
        })
    } catch (err) {
        printAndSendError(res, err)
    }
}

const getStudentByMatricula = async (req, res = response) => {
    const { id_student } = req
    try {
        const [student] = await db.query(getStuInfo, { replacements: { id: id_student }, type: QueryTypes.SELECT })
        Course.hasOne(Gro_cou, { foreignKey: 'id_course' })
        Gro_cou.belongsTo(Course, { foreignKey: 'id_course' })
        const { id_group } = student
        const { fisrt_sunday, last_sunday } = getFisrtAndLastSunday()
        const group = await Gro_cou.findOne({
            where: { id_group },
            include: {
                model: Course,
                attributes: ['course_name'],
            },
            where: {
                start_date: fisrt_sunday,
                end_date: last_sunday,
            }
        })
        let course;
        course = (group === null) ? "Materia no ha asignada al alumno" : group.toJSON()['course']['course_name']

        res.json({
            ok: true,
            student: { ...student, course }
        })
    } catch (err) {
        printAndSendError(res, err)
    }
}
const createStudent = async (req, res) => {

    const { body } = req;
    const { email } = body;
    const { id_group, id_campus } = body;
    const { matricula, street, zip, colony, birthdate, name, surname_f, surname_m, group_chief, curp, mobile_number, mobile_back_number, start_date, end_date } = body;
    let id_user, id_student, user
    try {
        //email
        const student = await Student.findOne({
            where: { matricula }
        })
        if (student) {
            //aqui hacer cosas de pros

            if (student.status === 1) {

                return res.status(400).json({
                    ok: false,
                    msg: "Ya existe un estudiante con la matricula " + matricula,
                })
            }
            else {
                const { id_student } = student
                try {
                   
                    const group = await Group.findOne({
                        where: { id_group }
                    })
                    if (!group) {
                        return res.status(400).json({
                            ok: false,
                            msg: "No existe un grupo con ese id " + id_group,
                        })
                    }
                    const campus = await Campus.findOne({
                        where: { id_campus }
                    })
                    if (!campus) {
                        return res.status(400).json({
                            ok: false,
                            msg: "No existe un campus con ese id " + id_campus,
                        })
                    }

                    const stu_gro = await Stu_gro.findOne({
                        where: { id_student: student.id_student }
                    })

                    await stu_gro.update({ id_group })

                } catch (error) {
                    printAndSendError(res, error)
                }
                try {
                    const cam_use = await Cam_use.findOne({
                        where: { id_user: student.id_user }
                    });

                    await cam_use.update({ id_campus })

                } catch (error) {
                    printAndSendError(res, error)
                }
                try {
                    await student.update({
                        status: 1, name, surname_f, surname_m, group_chief, curp, mobile_number, mobile_back_number,
                        street, zip, birthdate
                    })
                    return res.status(200).json({
                        ok: true,
                        msg: "El estudiante se creo correctamente",
                        id_student

                    })

                } catch (error) {
                    printAndSendError(res, error)

                }
            }
        }
        const studentCurp = await Student.findOne({
            where: { curp }
        })
        if (studentCurp) {
            return res.status(400).json({
                ok: false,
                msg: `Ya existe un estudiante con la CURP ${curp}`,
            })
        }


        const group = await Group.findOne({
            where: { id_group }
        })
        if (!group) {
            return res.status(400).json({
                ok: false,
                msg: "No existe un grupo con ese id " + id_group,
            })
        }
        const campus = await Campus.findOne({
            where: { id_campus }
        })
        if (!campus) {
            return res.status(400).json({
                ok: false,
                msg: "No existe un campus con ese id " + id_campus,
            })
        }


        const usern = new User({ user_type: "student", password: "123456" });
        const newUser = await usern.save()
        const userJson = newUser.toJSON();
        id_user = userJson['id_user']


    } catch (err) {
        printAndSendError(res, err)
    }
    try {
        //matricula
        id_student = generateMatricula(id_user)
        const student = new Student({ id_student, matricula, id_user, name, surname_f, surname_m, group_chief, curp, mobile_number, mobile_back_number, street, zip, colony, birthdate });
        await student.save();
        // password
        const user = await User.findByPk(id_user);
        const salt = bcrypt.genSaltSync();
        const pass = bcrypt.hashSync(matricula, salt)
        await user.update({ password: pass });

        const inst_email = `${id_student}@alejandria.edu.mx`
        await user.update({ email: inst_email })

    } catch (err) {
        printAndSendError(res, err)
    }
    try {
        const group = await Group.findByPk(id_group);
        if (!group) {
            return res.status(404).json({
                ok: false,
                msg: "No existe un grupo con el id " + id_major,
            });
        }
        const stu_gro = new Stu_gro({ id_student, id_group })
        await stu_gro.save();

    } catch (err) {
        printAndSendError(res, err)
    }
    try {
        //campus

        const cam_use = new Cam_use({ id_campus, id_user });
        await cam_use.save();
        return res.status(201).json({
            ok: true,
            msg: "Estudiante creado correctamente",
            id_student
        })


    } catch (err) {
        printAndSendError(res, err)
    }




}
const updateStudent = async (req, res) => {
    const { id } = req.params;
    const { body } = req;
    const { curp } = body
    const { matricula } = body;
    try {
        const student = await Student.findByPk(id);
        if (!student) {
            return res.status(404).json({
                ok: false,
                msg: "No existe un estudiante con el id " + id,
            });
        }

        const stu = await Student.findOne({
            where: {
                curp,
                id_student: { [Op.ne]: id }
            }
        })
        if (stu) {
            return res.status(400).json({
                ok: false,
                msg: `Ya existe un estudiante con la CURP ${curp}`
            })
        }
        const stu_matricula = await Student.findOne({
            where: {
                matricula,
                id_student: { [Op.ne]: id }
            }
        })
        if (stu_matricula) {
            return res.status(400).json({
                ok: false,
                msg: `Ya existe un estudiante con esa matricula ${matricula}`
            })
        }


        await student.update(body);
        res.status(200).json({
            ok: true,
            msg: "El estudiante se actualizo correctamente"
        })


    } catch (err) {
        printAndSendError(res, err)
    }
}

const deleteStudent = async (req, res) => {
    const { id } = req.params;

    try {
        const student = await Student.findOne({
            where: { id_student: id,  }
        });
        if (!student) {
            return res.status(404).json({
                ok: false,
                msg: "No existe un alumno con el id " + id,
            });
        }
        const studentStatus = await Student.findOne({
            where: { status:2   }
        });
        if (studentStatus) {
            return res.status(404).json({
                ok: false,
                msg: "No existe un alumno con el id " + id,
            });
        }

        await student.update({ status: 2 })
        res.status(200).json({
            ok: true,
            msg: "El alumno se elimino correctamente"
        })
    } catch (error) {
        printAndSendError(res, err)
    }
}






module.exports = {
    getAllStudents,
    getStudentByMatricula,
    createStudent,
    updateStudent,
    deleteStudent
}