const User = require('../models/user');
const Student = require('../models/student');
const bcrypt = require('bcryptjs');
const Group = require('../models/group');
const Stu_gro = require('../models/stu_gro');
const Cam_use = require('../models/cam_use');
const Campus = require('../models/campus');
const { Op, QueryTypes } = require('sequelize');
const { db } = require('../database/connection');
const { getStudents } = require('../queries/queries');
const generateMatricula = require('../helpers/generateMatricula');


const getAllStudents = async (req, res) => {
    const students = await db.query(getStudents, { type : QueryTypes.SELECT})

    return res.status(200).json({
        ok: true,
        students
    })
}

const createStudent = async (req, res) => {
    const { body } = req;
    const { email } = body;
    const { id_group, id_campus } = body;
    const { matricula,street,zip,colony,birthdate, name, surname_f,surname_m, group_chief, curp, mobile_number, mobile_back_number,  start_date, end_date } = body;
    let id_user, id_student, user
    try {
        //email
        const student = await Student.findOne({
            where: { matricula }
        })
        if (student) {
            return res.status(400).json({
                ok: false,
                msg: "Ya existe un estudiante con la matricula " + matricula,
            })
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
                msg: "No existe un grupo con ese id "+id_group,
            })
        }
        const campus = await Campus.findOne({
            where: { id_campus }
        })
        if (!campus) {
            return res.status(400).json({
                ok: false,
                msg: "No existe un campus con ese id "+id_campus,
            })
        }


            const usern = new User({ user_type: "student", password: "123456" });
            const newUser = await usern.save()
            const userJson = newUser.toJSON();
            id_user = userJson['id_user']


        

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador",
        })
    }
    try {
        //matricula
        id_student= generateMatricula(id_user) 
        const student = new Student({id_student, matricula, id_user, name, surname_f,surname_m, group_chief, curp, mobile_number, mobile_back_number, street ,zip,colony,birthdate  });
        await student.save();
        // password
        const user = await User.findByPk(id_user);
        const salt = bcrypt.genSaltSync();
        const pass = bcrypt.hashSync(matricula, salt)
        await user.update({ password: pass });

        const inst_email = `${id_student}@alejandria.edu.mx`
        await user.update({email : inst_email})

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador",
        })
    }
    try {
        const group = await Group.findByPk(id_group);
        if (!group) {
            return res.status(404).json({
                ok: false,
                msg: "No existe una grupo con el id " + id_major,
            });
        }
        const stu_gro = new Stu_gro({ id_student, id_group })
        await stu_gro.save();

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador",
        })
    }
    try {
        //campus

        const cam_use = new Cam_use({ id_campus, id_user });
        await cam_use.save();


    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador",
        })
    }

    res.status(201).json({
        ok: true,
        msg: "Estudiante creado correctamente"
})



}
const updateStudent = async (req, res) => {
    const { id } = req.params;
    const { body } = req;
    const { curp } = body
    const {matricula} = body;
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
                id_student : {[Op.ne] : id}
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
                id_student : {[Op.ne] : id}
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


    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador"
        })
    }
}

const deleteStudent = async (req, res) => {
    const { id } = req.params;

    try {
        const student = await Student.findOne({
            where : { id_student: id }
        });
        if (!student) {
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
    } catch (error) 
    {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador"
        })
    }


}






module.exports = {
    getAllStudents,
    createStudent,
    updateStudent,
    deleteStudent
}