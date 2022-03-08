const { response } = require("express");
const Course = require("../models/courses");
const { db } = require("../database/connection");
const { QueryTypes, Op } = require("sequelize");
const { getCourses } = require("../queries/queries");
const Major = require("../models/major");
const { printAndSendError } = require("../helpers/responsesOfReq");
const Gro_cou = require("../models/gro_cou");
const { setCourseInactivate } = require("../helpers/courses");
const Restriction = require("../models/restriction");
const ExtraCurricularCourses = require("../models/extracurricularcourses");

const getAllCourses = async (req, res = response) => {
  let { courseName = "" } = req.query;

  Course.belongsTo(Major, { foreignKey: "id_major" });
  Major.hasMany(Course, { foreignKey: "id_major" });

  try {
    let gro_cou = await Gro_cou.findAll();
    await Promise.all(
      gro_cou.map(async (gro_cou) => {
        gro_cou = await setCourseInactivate(gro_cou);
        return gro_cou.status;
      })
    );
    let courses = await Course.findAll({
      include: { model: Major, attributes: ["major_name"] },
      where: {
        [Op.or]: [
          {
            course_name: { [Op.like]: `%${courseName}%` },
          },
        ],
      },
    });

    courses = await Promise.all(
      courses.map(async (course) => {
        const { major, ...restoCourse } = course.toJSON();
        const restriction = await Restriction.findOne({
          restricted_course: restoCourse.id_course,
        });
        const {
          mandatory_course: restricted_by_course,
          mandatory_extracourse: restricted_by_extracourse,
        } = restriction.toJSON();
        return {
          ...restoCourse,
          restricted_by_course,
          restricted_by_extracourse,
          major_name: major.major_name,
        };
      })
    );
    return res.status(200).json({
      //200 means success
      ok: true,
      courses,
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

const createCourse = async (req, res = response) => {
  const { body } = req;
  const {
    id_major,
    course_name,
    restricted_by_course,
    restricted_by_extracourse,
  } = body;

  try {
    // Avoid duplicates
    const courseMajor = await Course.findOne({
      where: {
        id_major,
        course_name,
      },
    });

    if (courseMajor) {
      return res.status(400).json({
        ok: false,
        msg: `En la carrera ya esta registrado un curso con el nombre '${course_name}'.`,
      });
    }
    // Validate that the course restriction exists
    if (restricted_by_course) {
      const course_restriction = await Course.findByPk(restricted_by_course);
      if (!course_restriction) {
        return res.status(400).json({
          ok: false,
          msg: `El curso con id ${restricted_by_course} de restricción para el curso a crear no existe.`,
        });
      }
    }
    // Validate that the extracurricular course restriction exists
    if (restricted_by_extracourse) {
      const extracourse_restriction = await ExtraCurricularCourses.findByPk(
        restricted_by_extracourse
      );
      if (!extracourse_restriction) {
        return res.status(400).json({
          ok: false,
          msg: `El curso extracurricular con id ${restricted_by_extracourse} de restricción para el curso a crear no existe.`,
        });
      }
    }
    //  Create and save course
    const course = new Course(body);
    const courseSaved = await course.save();
    const { id_course } = courseSaved.toJSON();
    if (restricted_by_course !== null || restricted_by_extracourse !== null) {
      const restriction = new Restriction({
        restricted_course: id_course,
        mandatory_course: restricted_by_course,
        mandatory_extracourse: restricted_by_extracourse,
      });
      await restriction.save();
    }

    res.status(201).json({
      ok: true,
      msg: "Curso creado correctamente",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      ok: false,
      msg: "Hable con el administrador",
    });
  }
};

const updateCourse = async (req, res = response) => {
  const { id } = req.params;
  const { body } = req;
  const { id_major, course_name } = body;

  try {
    // Check if the record exists before updating
    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({
        ok: false,
        msg: `El curso con id ${id} no existe, verifiquelo por favor.`,
      });
    }

    // Check if the major exist
    const major = await Major.findOne({
      where: { id_major: body.id_major },
    });
    if (!major) {
      return res.status(404).json({
        ok: false,
        msg: "La carrera seleccionada no existe",
      });
    }

    // Avoid duplicates
    const courseMajor = await Course.findOne({
      where: {
        id_major,
        course_name,
      },
    });

    if (courseMajor) {
      return res.status(400).json({
        ok: false,
        msg: "En la carrera ya esta registrado un curso con ese nombre",
      });
    }
    // Update record in the database
    await Course.update(body, {
      where: { id_course: id },
    });

    return res.status(200).json({
      ok: true,
      msg: "Curso actualizado correctamente",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      ok: false,
      msg: "Hable con el administrador",
    });
  }
};

const deleteCourse = async (req, res = response) => {
  const { id } = req.params;

  try {
    const course = await Course.findByPk(id);

    // Check if the course exists
    if (!course) {
      return res.status(404).json({
        ok: false,
        msg: `El curso con id ${id} no existe, verifiquelo por favor.`,
      });
    }

    // Delete the record of the course
    await course.destroy();

    res.status(200).json({
      ok: true,
      msg: "Curso eliminado correctamente",
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

const addCourseRestriction = async (req, res = response) => {
  try {
    const restriction = new Restriction(req.body);
    await restriction.save();
    return res.status(201).json({
      ok: true,
      msg: "Restricción aplicada correctamente.",
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

module.exports = {
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  addCourseRestriction,
};
