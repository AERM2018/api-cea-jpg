const User = require("../models/user");
const Teacher = require("../models/teacher");
//const Cou_tea = require('../models/cou_tea');
const bcrypt = require("bcryptjs");
const Cam_use = require("../models/cam_use");
const Campus = require("../models/campus");
const { Op, QueryTypes, fn, col, literal, where } = require("sequelize");
const { db } = require("../database/connection");
const { getTeachers } = require("../queries/queries");
const { primaryKeyAttributes } = require("../models/user");
const { generateIdAle } = require("../helpers/generateIdOrMatricula");
const Cou_tea = require("../models/cou_tea");
const Gro_cou = require("../models/gro_cou");
const Group = require("../models/group");
const { printAndSendError } = require("../helpers/responsesOfReq");
const Course = require("../models/courses");
const ExtraCurricularCourses = require("../models/extracurricularcourses");
const Graduation_section = require("../models/graduation_section");
const Major = require("../models/major");
const Educational_level = require("../models/educational_level");
const Graduation_courses = require("../models/graduation_courses");
const {
  getRegularCourseInfo,
  getExtraCourseInfo,
  setCourseInactivate,
  setSectionInactivate,
  getCoursesGiveTeachersOrTeacher,
} = require("../helpers/courses");
const {
  getTeachersInfoWithTimeTable,
} = require("../helpers/getDataSavedFromEntities");

const getAllTeachers = async (req, res) => {
  const teachers = await getTeachersInfoWithTimeTable();
  return res.status(200).json({
    ok: true,
    teachers,
  });
};

const createTeacher = async (req, res) => {
  const { body } = req;
  const { name, surname_f, surname_m, rfc, mobile_number, email, id_campus } =
    body;
  let id_user, id_teacher, user;
  try {
    const teacher = await Teacher.findOne({
      where: { rfc },
    });
    const campus = await Campus.findOne({
      where: { id_campus },
    });
    if (!campus) {
      return res.status(400).json({
        ok: false,
        msg: "No existe un campus con ese id " + id_campus,
      });
    }
    if (teacher) {
      //Reactivate teacher
      const { id_teacher } = teacher.toJSON();
      await teacher.update({
        name,
        surname_f,
        surname_m,
        rfc,
        mobile_number,
        active: 1,
      });
      const teacherDB = await getTeachersInfoWithTimeTable(id_teacher);
      return res.status(201).json({
        ok: true,
        msg: "Maestro creado correctamente",
        teacher: teacherDB,
      });
    }

    const usern = new User({ user_type: "teacher", password: "123456" });
    const newUser = await usern.save();
    const userJson = newUser.toJSON();
    id_user = userJson["id_user"];
  } catch (error) {
    printAndSendError(res, err);
  }
  try {
    id_teacher = generateIdAle(id_user);
    const teacher = new Teacher({
      id_teacher,
      id_user,
      name,
      surname_f,
      surname_m,
      rfc,
      mobile_number,
    });
    const newTeacher = await teacher.save();
    const newTeacherJson = newTeacher.toJSON();
    id_teacher = newTeacherJson["id_teacher"];
    // create password
    user = await User.findByPk(id_user);
    const salt = bcrypt.genSaltSync();
    const pass = bcrypt.hashSync(id_teacher, salt);

    await user.update({ password: pass });

    const inst_email = `${id_teacher}@alejandria.edu.mx`;
    await user.update({ email: inst_email });
  } catch (error) {
    printAndSendError(res, err);
  }

  try {
    //campus
    const cam_use = new Cam_use({ id_campus, id_user });
    await cam_use.save();
    const teacherDB = await getTeachersInfoWithTimeTable(id_teacher);
    res.status(201).json({
      ok: true,
      msg: "Maestro creado correctamente",
      teacher: teacherDB,
    });
  } catch (error) {
    printAndSendError(res, err);
  }
};

const updateTeacher = async (req, res) => {
  const { id } = req.params;
  const { body } = req;
  const { rfc } = body;

  try {
    const teacher = await Teacher.findByPk(id);
    if (!teacher) {
      return res.status(404).json({
        ok: false,
        msg: "No existe un maestro con el id " + id,
      });
    }

    const teacherRfc = await Teacher.findOne({
      where: {
        rfc,
        id_teacher: { [Op.ne]: id },
      },
    });

    if (teacherRfc) {
      return res.status(400).json({
        ok: false,
        msg: `Ya existe un maestro con el RFC ${rfc}`,
      });
    }

    await teacher.update(body);
    res.status(200).json({
      ok: true,
      msg: "El maestro se actualizo correctamente",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Hable con el administrador",
    });
  }
};

const deleteTeacher = async (req, res) => {
  const { id } = req.params;
  try {
    const teacher = await Teacher.findOne({
      where: { id_teacher: id },
    });
    if (!teacher) {
      return res.status(404).json({
        msg: "No existe un maestro con el id " + id,
      });
    }

    if (teacher.active === 2 || teacher.active === 3) {
      return res.status(404).json({
        ok: false,
        msg: "No existe un maestro con el id " + id,
      });
    }

    await teacher.update({ active: 2 });

    res.status(200).json({
      ok: true,
      msg: "El maestro se elimino correctamente",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Hable con el administrador",
    });
  }
};

const getAllCoursesATeacherGiven = async (req, res = response) => {
  const { id_teacher } = req.params;
  const { courseName = "", teacherName = "", status = "all" } = req.query;
  try {
    const coursesTeachers = await getCoursesGiveTeachersOrTeacher({
      courseName,
      teacherName: undefined,
      id_teacher,
      status,
    });
    res.json({
      ok: true,
      courses: coursesTeachers,
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

const getAllCoursesTeachersGiven = async (req, res = response) => {
  const { courseName = "", teacherName = "", status = "all" } = req.query;
  try {
    const coursesTeachers = await getCoursesGiveTeachersOrTeacher({
      courseName,
      teacherName,
      id_teacher: undefined,
      status,
    });
    res.json({
      ok: true,
      courses: coursesTeachers,
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

module.exports = {
  getAllTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getAllCoursesATeacherGiven,
  getAllCoursesTeachersGiven,
};
