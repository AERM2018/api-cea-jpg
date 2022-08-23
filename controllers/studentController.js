const moment = require("moment");
const User = require("../models/user");
const Student = require("../models/student");
const bcrypt = require("bcryptjs");
const Group = require("../models/group");
const Stu_gro = require("../models/stu_gro");
const Cam_use = require("../models/cam_use");
const Campus = require("../models/campus");
const {
  Op,
  QueryTypes,
  EmptyResultError,
  where,
  fn,
  col,
} = require("sequelize");
const { db } = require("../database/connection");
const { getStudents, getStuInfo } = require("../queries/queries");
const {
  generateIdAle,
  generateMatricula,
} = require("../helpers/generateIdOrMatricula");
const { response } = require("express");
const Major = require("../models/major");
const Course = require("../models/courses");
const { getGroupDaysAndOverdue } = require("../helpers/dates");
const Gro_cou = require("../models/gro_cou");
const {
  getFeeCourseByMajor,
  document_types,
  getFeeSchoolByMajor,
} = require("../types/dictionaries");
const { printAndSendError } = require("../helpers/responsesOfReq");
const Gro_tim = require("../models/gro_tim");
const Time_tables = require("../models/time_tables");
const Cou_tea = require("../models/cou_tea");
const Teacher = require("../models/teacher");
const {
  getCourseStudentIsTaking,
  getStudentInfo,
} = require("../helpers/students");
const Stu_info = require("../models/stu_info");
const Educational_level = require("../models/educational_level");
const {
  hasGroupAGroupChief,
  assingStudentAsGroupChief,
  removeStudentAsGroupChief,
  isStudentGroupChiefOfGroup,
  studentGroupBelongsSameMajor,
} = require("../helpers/groups");
const Rol_use = require("../models/rol_use");
const Grades = require("../models/grades");
const Test = require("../models/test");
const { createGoogleAccount, changeGoogleAcountStatus } = require("../helpers/googleAccounts");
const { createMoodleAccount } = require("../helpers/moodleAccounts");

const getAllStudents = async (req, res) => {
  let { irregular = "" } = req.query;
  try {
    let students = await Student.findAll();
    students = await Promise.all(
      students.map(async (student) => await getStudentInfo(student.matricula))
    );
    students = students.filter((student) => student.status === 1);
    if (irregular !== "") {
      irregular = irregular === "true" ? "1" : "0";
      students = students.filter((student) => student.irregular === irregular);
    }
    return res.status(200).json({
      ok: true,
      students,
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

const getStudentByMatricula = async (req, res = response) => {
  const { matricula } = req.params;
  try {
    const student = await getStudentInfo(matricula);
    const course = await getCourseStudentIsTaking(student.id_group);
    return res.status(200).json({
      ok: true,
      student: { ...student, ...course },
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

const createStudent = async (req, res = response) => {
  let { matricula } = req.body;
  const {
    id_group,
    id_campus,
    street,
    email,
    zip,
    colony,
    birthdate,
    birthplace,
    age,
    name,
    surname_f,
    surname_m,
    curp,
    mobile_number,
    mobile_back_number,
    start_date,
    end_date,
    gender,
    group_chief,
    irregular,
  } = req.body;
  let id_user, id_student, user;
  try {
    //reactivate in case the matricula already exists
    const student = await Student.findOne({
      where: { curp },
    });
    if (student) {
      if (student.status === 1) {
        return res.status(400).json({
          ok: false,
          msg: `Ya existe un estudiante con la CURP ${curp}`,
        });
      } else {
        const { id_student, matricula } = student;
        let lastStudentGroup = await Stu_gro.findOne({
          where: { [Op.and]: [{ id_student }] },
        });
        const group = await Group.findOne({
          where: { id_group },
        });
        if (!group) {
          return res.status(400).json({
            ok: false,
            msg: "No existe un grupo con ese id " + id_group,
          });
        }
        // Cambiar de grupo al estudiante si es necesario
        if (lastStudentGroup) {
          if (lastStudentGroup.id_group !== id_group) {
            if (!(await studentGroupBelongsSameMajor(id_student, id_group))) {
              return res.status(400).json({
                ok: false,
                msg: `No se puede cambiar al alumno con matricula ${matricula} a otro grupo que no pertence a su carrera.`,
              });
            }
            // await lastStudentGroup.update({ id_group });
            lastStudentGroup = await Stu_gro.create({ id_student, id_group });
          }
        } else {
        }
        if (await isStudentGroupChiefOfGroup(id_student)) {
          await removeStudentAsGroupChief(lastStudentGroup.id_group);
        }

        const campus = await Campus.findOne({
          where: { id_campus },
        });
        if (!campus) {
          return res.status(400).json({
            ok: false,
            msg: "No existe un campus con ese id " + id_campus,
          });
        }
        const cam_use = await Cam_use.findOne({
          where: { id_user: student.id_user },
        });
        await cam_use.update({ id_campus });
        if (group_chief) {
          const group_chief_id_student = await hasGroupAGroupChief(id_group);
          if (group_chief_id_student) {
            if (group_chief_id_student !== id_student)
              return res.status(400).json({
                ok: false,
                msg: `El grupo con id ${id_group} ya cuenta con un jefe de grupo`,
              });
          } else {
            if (
              await isStudentGroupChiefOfGroup(id_student, {
                excludeCurrentStudentGroup: true,
              })
            )
              return res.status(400).json({
                ok: false,
                msg: `El estudiante ya es jefe de grupo de otro grupo`,
              });
            await assingStudentAsGroupChief(id_student, id_group);
          }
        } else {
          await removeStudentAsGroupChief(id_group);
        }
        await student.update({
          status: 1,
          name,
          surname_f,
          surname_m,
          curp,
          mobile_number,
          mobile_back_number,
          street,
          zip,
          birthdate,
          birthplace,
          age,
          irregular,
        });
        // Asignar grupo al estudiante
        // await Stu_gro.create({
        //   id_group: group.id_group,
        //   id_student: student.id_student,
        // });
        const studentUser = await User.findByPk(student.id_user);
        // Cambiar email del usuario si es necesario
        if (studentUser.email !== email) {
          studentUser.update({ email });
        }
        const result = await getStudentInfo(matricula);
        await changeGoogleAcountStatus(
          `${student.matricula}@alejandria.edu.mx`,
          false
        );
        return res.status(200).json({
          ok: true,
          msg: "El estudiante se creo correctamente",
          result,
        });
      }
    }

    const group = await Group.findOne({
      where: { id_group },
    });
    if (!group) {
      return res.status(400).json({
        ok: false,
        msg: "No existe un grupo con ese id " + id_group,
      });
    }

    const campus = await Campus.findOne({
      where: { id_campus },
    });
    if (!campus) {
      return res.status(400).json({
        ok: false,
        msg: "No existe un campus con ese id " + id_campus,
      });
    }
    const usern = await User.create({
      user_type: "student",
      password: "123456",
      email,
    });
    const { id_user } = usern.toJSON();
    // Generate matricula
    matricula = await generateMatricula(id_group, id_campus);
    // Generate id student
    id_student = generateIdAle(id_user);
    if (group_chief) {
      const group_chief_id_student = await hasGroupAGroupChief(id_group);
      if (group_chief_id_student) {
        if (group_chief_id_student !== id_student)
          return res.status(400).json({
            ok: false,
            msg: `El grupo con id ${id_group} ya cuenta con un jefe de grupo`,
          });
      } else {
        await assingStudentAsGroupChief(id_student, id_group);
      }
    }
    // Asignar rol al estudiante
    await Rol_use.create({ id_role: 8, id_user });

    const newStudent = new Student({
      id_student,
      matricula,
      id_user,
      name,
      surname_f,
      surname_m,
      curp,
      mobile_number,
      mobile_back_number,
      street,
      zip,
      colony,
      birthdate,
      birthplace,
      age,
      gender,
      irregular,
    });
    await newStudent.save();
    // password
    const user = await User.findByPk(id_user);
    const salt = bcrypt.genSaltSync();
    const pass = bcrypt.hashSync(matricula, salt);
    await user.update({ password: pass });
    const stu_gro = new Stu_gro({ id_student, id_group });
    await stu_gro.save();
    //campus
    const cam_use = new Cam_use({ id_campus, id_user });
    await cam_use.save();
    const result = await getStudentInfo(matricula);
    console.log(result);
    const response = await createGoogleAccount(result);
    if (!response.ok) {
      return res.json({ ok: false, msg: response.err.errors[0].message });
    }
    await createMoodleAccount(result, response.email);
    return res.status(201).json({
      ok: true,
      msg: "Estudiante creado correctamente",
      result,
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

const updateStudent = async (req, res) => {
  const { id } = req.params;
  const { body } = req;
  const { curp, id_group, group_chief, email, irregular } = body;
  try {
    const student = await Student.findByPk(id);
    if (!student) {
      return res.status(404).json({
        ok: false,
        msg: "No existe un estudiante con el id " + id,
      });
    }
    const { id_student, id_user } = student.toJSON();
    const stu = await Student.findOne({
      where: {
        [Op.and]: [{ curp }, { id_student: { [Op.ne]: id } }],
      },
    });
    if (stu) {
      return res.status(400).json({
        ok: false,
        msg: `Ya existe un estudiante con la CURP ${curp}`,
      });
    }
    let currentStudentGroup = await Stu_gro.findOne({
      where: { [Op.and]: [{ id_student }, { status: 1 }] },
    });
    const group = await Group.findOne({
      where: { id_group },
    });
    if (!group) {
      return res.status(400).json({
        ok: false,
        msg: "No existe un grupo con ese id " + id_group,
      });
    }
    // Cambiar de grupo al estudiante si es necesario
    if (currentStudentGroup) {
      if (currentStudentGroup.id_group !== id_group) {
        if (!(await studentGroupBelongsSameMajor(id_student, id_group))) {
          return res.status(400).json({
            ok: false,
            msg: `No se puede cambiar al alumno con matricula ${matricula} a otro grupo que no pertence a su carrera.`,
          });
        }
        await currentStudentGroup.update({ id_group });
      }
    } else {
      currentStudentGroup = await Stu_gro.create({ id_student, id_group });
    }
    if (await isStudentGroupChiefOfGroup(id_student)) {
      await removeStudentAsGroupChief(currentStudentGroup.id_group);
    }

    if (group_chief) {
      const group_chief_id_student = await hasGroupAGroupChief(id_group);
      if (group_chief_id_student) {
        if (group_chief_id_student !== id_student)
          return res.status(400).json({
            ok: false,
            msg: `El grupo con id ${id_group} ya cuenta con un jefe de grupo`,
          });
      } else {
        if (
          await isStudentGroupChiefOfGroup(id_student, {
            excludeCurrentStudentGroup: true,
          })
        )
          return res.status(400).json({
            ok: false,
            msg: `El estudiante ya es jefe de grupo de otro grupo`,
          });
        await assingStudentAsGroupChief(id_student, id_group);
      }
    } else {
      await removeStudentAsGroupChief(id_group);
    }
    await student.update(body);
    await User.update({ email }, { where: { id_user } });
    const result = await getStudentInfo(student.matricula);
    res.status(200).json({
      ok: true,
      msg: "El estudiante se actualizo correctamente",
      result,
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

const deleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    const student = await Student.findOne({
      where: { id_student: id },
    });
    if (!student) {
      return res.status(404).json({
        ok: false,
        msg: "No existe un alumno con el id " + id,
      });
    }

    if (student.status === 2 || student.status === 3) {
      return res.status(404).json({
        ok: false,
        msg: "No existe un alumno con el id " + id,
      });
    }

    await student.update({ status: 2 });
    const stu_gro = await Stu_gro.findOne({
      where: {
        [Op.and]: [{ id_student: student.id_student }, { status: 1 }],
      },
    });
    if (await isStudentGroupChiefOfGroup(student.id_student)) {
      await removeStudentAsGroupChief(stu_gro.id_group);
    }
    await Stu_gro.update(
      { status: 0 },
      { where: { id_student: student.id_student } }
    );
      await changeGoogleAcountStatus(`${student.matricula}@alejandria.edu.mx`,true)
    res.status(200).json({
      ok: true,
      msg: "El alumno se elimino correctamente",
    });
  } catch (error) {
    printAndSendError(res, error);
  }
};

const moveStudentFromGroup = async (req, res) => {
  const { id_group, matricula } = req.params;
  const { id_student } = req;

  Stu_gro.belongsTo(Group, { foreignKey: "id_group" });
  Group.hasOne(Stu_gro, { foreignKey: "id_group" });
  // Find student's current group and major
  const stu_gro = await Stu_gro.findOne({
    include: { model: Group, attributes: ["id_major", "id_group"] },
    where: { id_student },
    order: [["id_stu_gro", "desc"]],
  });
  const {
    groupss: { id_major: id_current_major, id_group: id_current_group },
  } = stu_gro.toJSON();
  if (id_current_group === parseInt(id_group)) {
    return res.status(400).json({
      ok: false,
      msg: `Accion denegada, no se pudo mover al estudiante con matricula ${matricula} ya que el nuevo grupo es el mismo donte actualmente está.`,
    });
  }
  const { id_major } = await Group.findByPk(id_group);
  if (id_current_major != id_major)
    return res.status(400).json({
      ok: false,
      msg: `Accion denegada, no se puede cambiar al alumno con matricula ${matricula} a otro grupo que no pertence a su carrera.`,
    });
  await stu_gro.update({ status: 0 });
  const new_stu_gro = new Stu_gro({ id_group, id_student });
  await new_stu_gro.save();
  if (await isStudentGroupChiefOfGroup(id_student)) {
    await removeStudentAsGroupChief(stu_gro.toJSON().id_group);
  }
  const studentGrades = await Grades.findAll({
    where: { [Op.and]: [{ id_student }, { grade: { [Op.in]: ["-", "NP"] } }] },
  });
  await Promise.all(
    studentGrades.map(async ({ id_course, id_grade, grade }) => {
      const { id_gro_cou: new_gro_cou } = (await Gro_cou.findOne({
        where: { [Op.and]: [{ id_group }, { id_course }] },
      })) || { id_gro_cou: undefined };
      if (new_gro_cou) {
        // Update test record of the grade in order to make the grade record appear as it was taken in the new group
        await Test.update({ id_gro_cou: new_gro_cou }, { where: { id_grade } });
      } else if (grade !== "NP") {
        // Delete grade record with "-" in case the new group hasn't taken the course
        await Test.destroy({ where: { id_grade } });
        await Grades.destroy({ where: { id_grade } });
      }
    })
  );
  return res.json({
    ok: true,
    msg: `El estudiante con matricula ${matricula} fue cambiado correctamente.`,
  });
};

const createStudentSchoolAccounts = async (req, res) => {
  const { id_student } = req;
  try {
    const student = await Stu_info.findOne({
      where: { id_student },
      attributes: { exclude: ["id"] },
    });
    const response = await createGoogleAccount(student);
    if (!response.ok) {
      return res.json({ ok: false, msg: response.err.errors[0].message });
    }
    await createMoodleAccount(student, response.email);
    res.json({
      ok: true,
      msg: "Cuentas creadas exitosamente",
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};
module.exports = {
  getAllStudents,
  getStudentByMatricula,
  createStudent,
  updateStudent,
  moveStudentFromGroup,
  deleteStudent,
  createStudentSchoolAccounts,
};
