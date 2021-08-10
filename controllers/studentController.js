const moment = require('moment')
const User = require('../models/user');
const Student = require('../models/student');
const bcrypt = require('bcryptjs');
const Group = require('../models/group');
const Stu_gro = require('../models/stu_gro');
const Cam_use = require('../models/cam_use');
const Campus = require('../models/campus');
const { Op, QueryTypes, EmptyResultError, where, fn, col } = require('sequelize');
const { db } = require('../database/connection');
const { getStudents, getStuInfo } = require('../queries/queries');
const generateMatricula = require('../helpers/generateMatricula');
const { response } = require('express');
const Major = require('../models/major');
const Course = require('../models/courses');
const { getGroupDaysAndOverdue } = require('../helpers/dates');
const Gro_cou = require('../models/gro_cou');
const { getFeeCourseByMajor, document_types, getFeeSchoolByMajor } = require('../types/dictionaries');
const { printAndSendError } = require('../helpers/responsesOfReq');
const Gro_tim = require('../models/gro_tim');
const Time_tables = require('../models/time_tables');
const Cou_tea = require('../models/cou_tea');
const Teacher = require('../models/teacher');


const getAllStudents = async (req, res) => {
    try {
        // const students = await db.query(getStudents, { type: QueryTypes.SELECT })
        Cam_use.belongsTo(Campus,{ foreignKey: 'id_campus'});
        Campus.hasMany(Cam_use, { foreignKey: 'id_campus'});

        Cam_use.belongsTo(User,{ foreignKey: 'id_user'});
        User.hasOne(Cam_use, { foreignKey: 'id_user'});

        Student.belongsTo(User,{ foreignKey: 'id_user'});
        User.hasOne(Student,{ foreignKey: 'id_user'});

        Stu_gro.belongsTo(Student,{ foreignKey : 'id_student'})
        Student.hasMany(Stu_gro,{ foreignKey : 'id_student'})

        Stu_gro.belongsTo(Group,{ foreignKey : 'id_group'})
        Group.hasMany(Stu_gro,{ foreignKey : 'id_group'})

        let students = await Student.findAll({
            include : [{
             model : User,
             attributes : { 
                 exclude : ['user_type','email','password']
             },
             include : {
                 model : Cam_use,
                 attributes : {
                     exclude : ['id_user','id_cam_use']
                 },
                 include : {
                     model : Campus,
                     attributes : ['campus_name']
                 }
             }   
            },
            {
                model : Stu_gro,
                include : {
                    model : Group,
                    attributes : ['name_group']
                }
            }]
        })

        students = students.map( student => {
            const {user,stu_gros,...restoStudent} = student.toJSON()
            return {
                ...restoStudent,
                id_campus : user.cam_use.id_campus,
                campus_name : user.cam_use.campus.campus_name,
                id_group : stu_gros[stu_gros.length - 1].id_group,
                group_name : stu_gros[stu_gros.length - 1].groupss.name_group
            }
        })

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
    let course;
    try {
        const [student] = await db.query(getStuInfo, { replacements: { id: id_student }, type: QueryTypes.SELECT })
        Course.hasOne(Gro_cou, { foreignKey: 'id_course' })
        Gro_cou.belongsTo(Course, { foreignKey: 'id_course' })
        const { id_group } = student

        const {first_day,last_day} = await getGroupDaysAndOverdue( id_group )
        const gro_cou = await Gro_cou.findOne({
            include: {
                model: Course,
                attributes: ['course_name'],
            },
            where: {
                id_group,
                start_date :{ [Op.gte] : moment(first_day).startOf('month').format().substr(0,10)},
                end_date: { [Op.lte]: moment(last_day).endOf('month').format().substr(0,10) },
            }

        })

        if(gro_cou){
            course = {course_name: gro_cou.toJSON().course.course_name}
            const {id_course} = gro_cou
            Cou_tea.belongsTo(Teacher, {foreignKey: 'id_teacher'})
            Teacher.hasMany(Cou_tea, {foreignKey : 'id_teacher'})
            let courseTeacher = await Cou_tea.findOne({
                where : {id_course},
                include : {model : Teacher, attributes: [
                    [fn('concat',col('name')," ",col('surname_f')," ",col('surname_m')),'name'],
                ]}
            })
            course = {...course, teacher : courseTeacher.toJSON().teacher.name}
        }else{
            course = {course_name:'Materia no asignada'}
        }

        return res.status(200).json({
            ok: true,
            student: { ...student, ...course }
        })

    }catch( err ){
        printAndSendError(res, err)
    }
}

const createStudent = async (req, res = response) => {
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
    const {status}=req.body;
    try {

        const student = await Student.findOne({
            where: { id_student: id }
        });
        if (!student) {
            return res.status(404).json({
                ok: false,
                msg: "No existe un alumno con el id " + id,
            });
        }
    
        if (student.status===2 || student.status===3) {
            return res.status(404).json({
                ok: false,
                msg: "No existe un alumno con el id " + id,
            });
        }

        await student.update({ status })
        res.status(200).json({
            ok: true,
            msg: "El alumno se elimino correctamente"
        })
    }

    catch (error) {
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