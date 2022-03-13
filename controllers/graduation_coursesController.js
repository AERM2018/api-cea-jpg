const { response, request } = require("express");
const moment = require("moment");
const { db } = require("../database/connection");
const Teacher = require("../models/teacher");
const Graduation_courses = require("../models/graduation_courses");
const Graduation_section = require("../models/graduation_section");
const { Op, fn, col, literal } = require("sequelize");
const { printAndSendError } = require("../helpers/responsesOfReq");
const Stu_gracou = require("../models/stu_gracou");
const Student = require("../models/student");
const {
  setSectionInactivate,
  setCourseInactivate,
} = require("../helpers/courses");
const Group = require("../models/group");
const Gro_cou = require("../models/gro_cou");
const Time_tables = require("../models/time_tables");
const Gro_tim = require("../models/gro_tim");
const {
  getGroupDaysAndOverdue,
  findAssistenceDays,
} = require("../helpers/dates");
const Stu_gro = require("../models/stu_gro");
const {
  getGraduationCourseInfoWithSections,
} = require("../helpers/getDataSavedFromEntities");
const Gra_sec_ass = require("../models/gra_sec_ass");

const getAllGraduationCourses = async (req = request, res = response) => {
  let { courseGradName = "", status = "all" } = req.query;
  let statusCondition = status == "all" ? undefined : { status };
  try {
    const graduation_coursesDB = await getGraduationCourseInfoWithSections(
      undefined,
      courseGradName,
      statusCondition
    );
    return res.status(200).json({
      //200 means success
      ok: true,
      graduation_courses: graduation_coursesDB,
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

const createGraduationCourses = async (req, res = response) => {
  const { sections = [], ...restGraduationCourse } = req.body;
  try {
    const { id_graduation_course } = await Graduation_courses.create(
      restGraduationCourse
    );
    while (sections.length > 0) {
      let graduation_section = new Graduation_section({
        ...sections[0],
        id_graduation_course,
      });
      await graduation_section.save();
      sections.shift();
    }
    const result = await getGraduationCourseInfoWithSections(
      id_graduation_course,
      undefined,
      undefined
    );
    res.status(201).json({
      ok: true,
      msg: "Curso de graduación creado correctamente",
      result,
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

const updateGraduationCourses = async (req, res = response) => {
  const { id_graduation_course } = req.params;
  const { body } = req;

  try {
    // Check if the record exists before updating
    const graduation_course = await Graduation_courses.findByPk(
      id_graduation_course
    );
    // Update record in the database
    await Graduation_courses.update(body, {
      where: { id_graduation_course },
    });
    const result = await getGraduationCourseInfoWithSections(
      id_graduation_course,
      undefined,
      undefined
    );
    return res.status(200).json({
      ok: true,
      msg: "El curso de graduación ha sido actualizado correctamente",
      result,
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

const deleteGraduationCourses = async (req, res = response) => {
  const { id_graduation_course } = req.params;
  try {
    const sections = await Graduation_section.findAll({
      where: { id_graduation_course },
    });
    await Promise.all(
      sections.map(async (section) => {
        const section_assistances = await Gra_sec_ass.findAll({
          where: { id_graduation_section: section.id_graduation_section },
        });
        while (section_assistances.length > 0) {
          await section_assistances[0].destroy();
          section_assistances.shift();
        }
        await section.destroy();
      })
    );
    await Stu_gracou.destroy({ where: { id_graduation_course } });
    await Graduation_courses.destroy({ where: { id_graduation_course } });
    res.status(200).json({
      ok: true,
      msg: "El curso de graduación se eliminó correctamente",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Hable con el administrador",
    });
  }
};

const getStudentsFromGradCourse = async (req, res) => {
  const { id_graduation_course } = req.params;
  try {
    Stu_gracou.belongsTo(Graduation_courses, {
      foreignKey: "id_graduation_course",
    });
    Graduation_courses.hasMany(Stu_gracou, {
      foreignKey: "id_graduation_course",
    });

    Stu_gracou.belongsTo(Student, { foreignKey: "id_student" });
    Student.hasOne(Stu_gracou, { foreignKey: "id_student" });

    let studentsGradCou = await Stu_gracou.findAll({
      include: [
        {
          model: Graduation_courses,
          attributes: ["id_graduation_course", "course_grad_name"],
        },
        {
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
              "student_name",
            ],
          ],
        },
      ],
      where: { id_graduation_course },
    });

    studentsGradCou = studentsGradCou.map((studentGradCou) => {
      const { graduation_course, student, ...restoStudentGradCou } =
        studentGradCou.toJSON();
      return {
        ...restoStudentGradCou,
        ...graduation_course,
        ...student,
      };
    });
    res.json({
      ok: true,
      students: studentsGradCou,
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

module.exports = {
  getAllGraduationCourses,
  createGraduationCourses,
  updateGraduationCourses,
  deleteGraduationCourses,
  getStudentsFromGradCourse,
};
