const { response } = require("express");
const Scholarship = require("../models/scholarship");
const { db } = require("../database/connection");
const { QueryTypes, fn, col } = require("sequelize");
const Sch_stu = require("../models/sch_stu");
const { getScholarships } = require("../queries/queries");
const Student = require("../models/student");

const getAllScholarships = async (req, res = response) => {
  Sch_stu.belongsTo(Scholarship, { foreignKey: "id_scholarship" });
  Scholarship.hasOne(Sch_stu, { foreignKey: "id_scholarship" });
  Sch_stu.belongsTo(Student, { foreignKey: "id_student" });
  Student.hasOne(Sch_stu, { foreignKey: "id_student" });

  try {
    let scholarships = await Scholarship.findAll({
      include: {
        model: Sch_stu,
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
              "student_name",
            ],
          ],
        },
      },
      attributes: {
        include: [[fn("concat", col("percentage"), "%"), "percentage"]],
      },
    });
    scholarships = scholarships.map((scholarship) => {
      const { sch_stu, ...restScholarship } = scholarship.toJSON();
      return {
        ...restScholarship,
        id_student: sch_stu.student.id_student,
        matricula: sch_stu.student.matricula,
        student_name: sch_stu.student.student_name,
      };
    });
    res.status(200).json({
      ok: true,
      scholarships,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      msg: "Hable con el administrador",
    });
  }
};

const createScholarship = async (req, res = response) => {
  const { body } = req;
  const { matricula, scholarship_name, percentage, reason, observations } =
    body;

  try {
    // check if the student exists
    const student = await Student.findOne({
      where: { matricula: matricula },
    });
    if (!student) {
      return res.status(404).json({
        ok: false,
        msg: `El estudiante con id ${matricula} no existe, verifiquelo por favor.`,
      });
    }

    const scholarship = new Scholarship({
      scholarship_name,
      percentage,
      reason,
      observations,
    });
    const newSch = await scholarship.save();
    const id_scholarship = newSch.toJSON()["id_scholarship"];

    const sch_stu = new Sch_stu({
      id_scholarship,
      id_student: student.id_student,
    });
    await sch_stu.save();

    res.status(201).json({
      ok: true,
      msg: "La beca se creo correctamente.",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      ok: false,
      msg: "Hable con el adminstrador.",
    });
  }
};

const updateScholarship = async (req, res = response) => {
  const { id_scholarship } = req.params;
  const { matricula, ...rest } = req.body;

  try {
    // Check if the scholarship exists
    const scholarship = await Scholarship.findByPk(id_scholarship);
    if (!scholarship) {
      return res.status(404).json({
        ok: false,
        msg: `La beca con id ${id_scholarship} no existe, verifiquelo por favor.`,
      });
    }
    // check if the student exists
    const student = await Student.findOne({
      where: { matricula: matricula },
    });
    if (!student) {
      return res.status(404).json({
        ok: false,
        msg: `El estudiante con id ${matricula} no existe, verifiquelo por favor.`,
      });
    }
    const sch_stu = await Sch_stu.findOne({
      where: { id_scholarship: scholarship.id_scholarship },
    });
    if (sch_stu.id_student != student.id_student) {
      await sch_stu.update({ id_student: student.id_student });
    }
    await Scholarship.update(
      { ...rest },
      { where: { id_scholarship: id_scholarship } }
    );
    res.status(200).json({
      ok: true,
      msg: `La beca se actualizo correctamente.`,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      ok: false,
      msg: "Hable con el adminstrador.",
    });
  }
};

const deleteScholarship = async (req, res = response) => {
  const { id_scholarship } = req.params;
  try {
    // Check if the scholarship exists
    const scholarship = await Scholarship.findByPk(id_scholarship);
    if (!scholarship) {
      return res.status(404).json({
        ok: false,
        msg: `La beca con id ${id_scholarship} no existe, verifiquelo por favor.`,
      });
    }

    const studentScholarship = await Sch_stu.findOne({
      where: { id_scholarship: scholarship.toJSON().id_scholarship },
    });

    await studentScholarship.destroy();
    await scholarship.destroy();

    res.status(200).json({
      ok: true,
      msg: `La beca se elimino correctamente.`,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      ok: false,
      msg: "Hable con el adminstrador.",
    });
  }
};

module.exports = {
  getAllScholarships,
  createScholarship,
  updateScholarship,
  deleteScholarship,
};
