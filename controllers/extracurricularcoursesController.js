const { response, request } = require("express");
const moment = require("moment");
const { db } = require("../database/connection");
const Teacher = require("../models/teacher");
const Graduation_courses = require("../models/graduation_courses");
const Graduation_section = require("../models/graduation_section");
const { Op, fn, col, literal, where, DataTypes } = require("sequelize");
const { printAndSendError } = require("../helpers/responsesOfReq");
const ExtraCurricularCourses = require("../models/extracurricularcourses");
const Stu_extracou = require("../models/stu_extracou");
const Student = require("../models/student");
const { getExtraCourseInfo } = require("../helpers/courses");
const Time_tables = require("../models/time_tables");
const { findAssistenceDays } = require("../helpers/dates");
const {
  getExtraCoursesWithTimeTable,
} = require("../helpers/getDataSavedFromEntities");

const getAllExtraCurricularCourses = async (req = request, res = response) => {
  let { teacherName = "", status = "all" } = req.query;
  const statusCondition = status == "all" ? {} : { status };
  try {
    const extracurricular_courses = await getExtraCoursesWithTimeTable(
      undefined,
      true,
      teacherName,
      statusCondition.status,
      false
    );
    return res.status(200).json({
      ok: true,
      extracurricular_courses,
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

const createExtraCurricularCourse = async (req, res = response) => {
  const { body } = req;
  const { start_hour, finish_hour, start_date } = body;

  try {
    const day = moment(start_date).day();
    // Look for if there's coincidences in the time table chose
    let time_table = await Time_tables.findOne({
      where: { day, start_hour, finish_hour },
    });
    if (!time_table) {
      const new_time_table = new Time_tables({ day, start_hour, finish_hour });
      time_table = await new_time_table.save();
      time_table = time_table.toJSON();
    }
    body.id_time_table = time_table.id_time_table;
    const extracurricular_course = await ExtraCurricularCourses.create({
      ...body,
    });
    const extraCourseDB = await getExtraCoursesWithTimeTable(
      extracurricular_course.id_ext_cou,
      true,
      "",
      1,
      false
    );
    res.status(201).json({
      ok: true,
      msg: "Curso extra curricular creado correctamente",
      extracurricular_course: extraCourseDB,
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

const updateExtraCurricularCourse = async (req, res = responde) => {
  const { id_ext_cou } = req.params;
  const { body } = req;
  try {
    // Check if the record exists before updating
    const extracurricular_course = await ExtraCurricularCourses.findByPk(
      id_ext_cou
    );
    // Update record in the database
    await ExtraCurricularCourses.update(body, { where: { id_ext_cou } });
    return res.status(200).json({
      ok: true,
      msg: "Curso extra curricular actualizado correctamente",
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

const deleteExtraCurricularCourse = async (req, res = responde) => {
  const { id_ext_cou } = req.params;
  try {
    // Delete the record of the graduation section
    await ExtraCurricularCourses.destroy({ where: { id_ext_cou } });
    res.status(200).json({
      ok: true,
      msg: "Curso extracurricular eliminado correctamente",
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

const getStudentsFromExtraCourse = async (req, res = response) => {
  const { id_ext_cou } = req.params;
  Stu_extracou.belongsTo(Student, { foreignKey: "id_student" });
  Student.hasOne(Stu_extracou, { foreignKey: "id_student" });
  let studentsSignedUp = await Stu_extracou.findAll({
    include: {
      model: Student,
      attributes: [
        "id_student",
        "matricula",
        [
          fn(
            "concat",
            col("name"),
            " ",
            col("surname_f"),
            " ",
            col("surname_m")
          ),
          "name",
        ],
      ],
    },
    where: { id_ext_cou },
    raw: true,
    nest: true,
  });
  studentsSignedUp = studentsSignedUp.map(({ student }) => ({ ...student }));
  res.json({
    ok: true,
    students: studentsSignedUp,
  });
};

module.exports = {
  getAllExtraCurricularCourses,
  createExtraCurricularCourse,
  updateExtraCurricularCourse,
  deleteExtraCurricularCourse,
  getStudentsFromExtraCourse,
};
