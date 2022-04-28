const { Op, literal } = require("sequelize");
const moment = require("moment");
const { printAndSendError } = require("../helpers/responsesOfReq");
const Grades = require("../models/grades");
const Gro_cou = require("../models/gro_cou");
const Stu_gro = require("../models/stu_gro");
const Test = require("../models/test");
const getTestInfo = require("../helpers/tests");
const Course = require("../models/courses");

const assignTestToStudent = async (req, res) => {
  const { id_student } = req;
  const { application_date, id_course } = req.body;
  try {
    const { id_group } = await Stu_gro.findOne({
      where: { [Op.and]: [{ id_student }, { status: 1 }] },
      attributes: ["id_group"],
      raw: true,
    });
    const gro_cou = await Gro_cou.findOne({
      where: { [Op.and]: [{ id_group }, { id_course }] },
      attributes: ["id_gro_cou"],
      raw: true,
    });
    if (!gro_cou) {
      return res.status(404).json({
        ok: false,
        msg: "El grupo actual de él estudiante no se le ha asignado la materia correspondiente al exámen que se quiere asignar",
      });
    }
    const { folio: lastFolio } =
      (await Test.findOne({
        attributes: ["folio"],
        order: [["folio", "DESC"]],
        raw: true,
      })) || 0;
    const { id_grade } = await Grades.findOne({
      where: { [Op.and]: [{ id_student }, { id_course }] },
      attributes: ["id_grade"],
      raw: true,
    });
    const test = await Test.update(
      {
        folio: lastFolio + 1,
        type: "Extraordinario",
        application_date,
        assigned_test_date: moment().format("YYYY-MM-DD"),
        applied: false,
      },
      { where: { id_grade } }
    );
    // await Grades.update({ grade: "-" }, { where: { id_grade } });
    return res.json({
      ok: true,
      msg: "Examen asignado correctamente.",
    });
  } catch (error) {
    printAndSendError(res, error);
  }
};

const getTests = async (req, res) => {
  const { applied, dateOrder = "desc" } = req.query;
  try {
    const tests = await getTestInfo(
      false,
      { ...(applied != undefined ? { applied } : {}) },
      dateOrder
    );
    res.json({
      ok: true,
      tests,
    });
  } catch (error) {
    printAndSendError(res, error);
  }
};

const changeApplicationDate = async (req, res) => {
  const { application_date } = req.body;
  const { id_test } = req.params;
  try {
    const test = await Test.findByPk(id_test);
    await test.update({ application_date });
    return res.json({
      ok: true,
      msg: `Fecha de aplicación del examen con id ${test.id_test} actualizada correctamente.`,
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

const getTestStudentCanTake = async (req, res) => {
  try {
    const { id_student } = req;
    Grades.belongsTo(Course, { foreignKey: "id_course" });
    Course.hasMany(Grades, { foreignKey: "id_course" });
    let grades = await Grades.findAll({
      where: {
        [Op.and]: [
          { id_student },
          {
            [Op.or]: [
              { grade: "NP" },
              { grade: { [Op.notIn]: ["7", "8", "9", "10"] } },
            ],
          },
        ],
      },
      include: { model: Course },
    });
    if (grades.length > 0) {
      grades = grades.map(({ course: { id_course, course_name } }) => ({
        id_course,
        course_name,
      }));
    }
    return res.json({
      ok: true,
      tests: grades,
    });
  } catch (error) {
    printAndSendError(res, error);
  }
};

module.exports = {
  assignTestToStudent,
  getTests,
  changeApplicationDate,
  getTestStudentCanTake,
};
