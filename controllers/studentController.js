const User = require('../models/user');
const Student = require('../models/student');
const bcrypt = require('bcryptjs');
const Group = require('../models/group');
const Stu_gro = require('../models/stu_gro');
const Cam_use = require('../models/cam_use');
const Campus = require('../models/campus')

const getAllStudents = async (req, res) => {
    const students = await Student.findAll({
        where: { 'status': 2 }
    });

    return res.status(200).json({
        ok: true,
        students
    })
}

const createStudent = async (req, res) => {
    const { body } = req;
    const { email } = body;
    const { id_group, id_campus } = body;
    const { id_student, name, surname, group_chief, curp, status, mobile_number, mobile_back_number, address, start_date, end_date, complete_documents } = body;
    let id_user
    try {
        //email
        const student = Student.findOne({
            where: { id_student }
        })
        if (student) {
            return res.status(400).json({
                ok: false,
                msg: "Ya existe un alumno",
            })
        }
        const group = Group.findOne({
            where: { id_group }
        })
        if (!group) {
            return res.status(400).json({
                ok: false,
                msg: "No existe un grupo con ese id "+id_group,
            })
        }
        const campus = Campus.findOne({
            where: { id_campus }
        })
        if (!campus) {
            return res.status(400).json({
                ok: false,
                msg: "No existe un campus con ese id "+id_campus,
            })
        }


        const user = User.findOne({ where: { email } })
        if (!user) {
            const usern = new User({ user_type: "student", email, password: "123456" });
            const newUser = await usern.save()
            const userJson = newUser.toJSON();
            id_user = userJson['id_user']
        }
        else {
            return res.status(400).json({
                ok: false,
                msg: "Ya existe un usuario con ese email",
            })
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador",
        })
    }
    try {
        //matricula
        const student = new Student({ id_student, id_user, name, surname, group_chief, curp, status, mobile_number, mobile_back_number, address, start_date, end_date, complete_documents });
        await student.save();
        // password
        const user = await User.findByPk(id_user);
        const salt = bcrypt.genSaltSync();
        const pass = bcrypt.hashSync(id_student, salt)
        await user.update({ password: pass });

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
    try {
        const student = await Student.findByPk(id);
        if (!student) {
            return res.status(404).json({
                ok: false,
                msg: "No existe un estudiante con el id " + id,
            });
        }

        const stu = await Student.findOne({
            where: { curp }
        })
        if (stu) {
            return res.status(400).json({
                ok: false,
                msg: "Ya existe un estudiante con esa curp"
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
        const student = await Student.findByPk(id);
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
    } catch (error) {
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