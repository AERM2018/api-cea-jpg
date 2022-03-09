const moment = require("moment");
const Gro_tim = require("../models/gro_tim");
const Group = require("../models/group");
const Time_tables = require("../models/time_tables");
const Major = require("../models/major");
const Stu_gro = require("../models/stu_gro");
const { Op, fn, col, literal } = require("sequelize");
const Courses = require("../models/courses");
const Gro_cou = require("../models/gro_cou");
const { response } = require("express");
const Student = require("../models/student");
const { printAndSendError } = require("../helpers/responsesOfReq");
const Cou_tea = require("../models/cou_tea");
const {
  getGroupInfo,
  getTitularTeacherOfCourse,
  assingStudentAsGroupChief,
  removeStudentAsGroupChief,
} = require("../helpers/groups");
const { setCourseInactivate } = require("../helpers/courses");
const Cam_gro = require("../models/cam_gro");
const Campus = require("../models/campus");
const {
  getGroupDaysAndOverdue,
  findAssistenceDays,
} = require("../helpers/dates");

const getAllGroups = async (req, res) => {
  let groups = [];
  try {
    groups = await getGroupInfo();
    groups = await Promise.all(
      groups.map(async (group) => {
        const gro_tim = await Gro_tim.findAll({
          where: { id_group: group.id_group },
          attributes: ["id_time_table"],
        });
        const time_table = await Time_tables.findAll({
          where: {
            id_time_table: {
              [Op.in]: gro_tim.map(
                (time_table) => time_table.toJSON().id_time_table
              ),
            },
          },
          attributes: {
            exclude: ["id_time_table"],
            include: [
              [fn("date_format", col("start_hour"), "%H:%i"), "start_hour"],
              [fn("date_format", col("finish_hour"), "%H:%i"), "finish_hour"],
            ],
          },
        });
        return {
          ...group,
          time_table: time_table.map((time_table) => time_table.toJSON()),
        };
      })
    );
    res.json({
      ok: true,
      groups,
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

const createGroup = async (req, res) => {
  const { id_major, name_group, entry_year, end_year, time_table, id_campus } =
    req.body;
  let id_group, id_time_table;
  let ids_emp_tim;
  try {
    const major = await Major.findByPk(id_major);
    const groupCoincidence = await Group.findOne({
      where: { name_group },
    });
    if (groupCoincidence) {
      return res.status(404).json({
        ok: false,
        msg: "Ya existe una un grupo con el nombre " + name_group,
      });
    }
    const group = new Group({
      id_major: major.id_major,
      name_group,
      entry_year,
      end_year,
    });
    const newGroup = await group.save();
    const groupJson = newGroup.toJSON();
    id_group = groupJson["id_group"];
    const cam_gro = new Cam_gro({ id_campus, id_group });
    await cam_gro.save();

    ids_emp_tim = time_table.map(async (x) => {
      let { day, start_hour, finish_hour } = x;
      const time = await Time_tables.findAll({
        where: { day: day, start_hour: start_hour, finish_hour: finish_hour },
      });
      if (time.length < 1) {
        const time_table = new Time_tables({ day, start_hour, finish_hour });
        const newTime_Table = await time_table.save();
        const newTime_tableJson = newTime_Table.toJSON();
        id_time_table = newTime_tableJson["id_time_table"];
        return id_time_table;
      } else {
        return time[0].id_time_table;
      }
    });

    ids_emp_tim.forEach(async (x) => {
      id_time_table = await x;
      const gro_tim = new Gro_tim({ id_group, id_time_table });
      await gro_tim.save();
    });

    res.status(201).json({
      ok: true,
      msg: "Grupo creado correctamente",
    });
  } catch (error) {
    printAndSendError(res, error);
  }
};

const updateGroup = async (req, res) => {
  const { id_group } = req.params;
  const { name_group = "", id_campus } = req.body;
  try {
    const group = await Group.findByPk(id_group);
    if (name_group != "") {
      const groupCoincidence = await Group.findOne({
        where: {
          name_group,
          id_group: { [Op.ne]: id_group },
        },
      });
      if (groupCoincidence)
        return res.status(400).json({
          ok: false,
          msg: `Ya existe un grupo con el nombre ${name_group}`,
        });
      await group.update({ name_group });
    }
    if (id_campus) {
      const campus = await Campus.findByPk(id_campus);
      if (!campus)
        return res.status(404).json({
          ok: false,
          msg: `Campus con id ${id_campus} no encontrado.`,
        });
      await Cam_gro.update({ id_campus }, { where: { id_group } });
    }
    res.status(200).json({
      ok: true,
      msg: "El grupo se actualizo correctamente",
    });
  } catch (error) {
    printAndSendError(res, error);
  }
};

const deleteGroup = async (req, res) => {
  const { id_group } = req.params;
  try {
    const group = await Group.findByPk(id_group);
    const gro_tim = await Gro_tim.findAll({
      where: { id_group },
    });
    gro_tim.forEach(async (grupo) => {
      await grupo.destroy();
    });
    await Cam_gro.destroy({ where: { id_group } });
    await group.destroy();
    res.status(200).json({
      ok: true,
      msg: "El grupo se elimino correctamente",
    });
  } catch (error) {
    printAndSendError(res, error);
  }
};

const addCourseGroup = async (req, res) => {
  const { id_group, id_course } = req.params;
  const { id_teacher } = req.body;
  let { start_date, end_date } = req.body;

  try {
    const groupCourse = await Gro_cou.findOne({
      where: {
        [Op.and]: [{ id_course }, { id_group }],
      },
    });
    if (groupCourse) {
      return res.status(400).json({
        ok: false,
        msg: `Ya existe una materia en ese grupo con el id ${id_course}`,
      });
    }
    if (!start_date || !end_date) {
      const { first_day, last_day } = await getGroupDaysAndOverdue(id_group);
      start_date = first_day;
      end_date = last_day;
    }
    const gro_cou = new Gro_cou({ id_group, id_course, start_date, end_date });
    await gro_cou.save();
    const cou_tea = new Cou_tea({
      id_course,
      id_teacher,
      start_date,
      end_date,
    });
    await cou_tea.save();
    res.status(200).json({
      ok: true,
      msg: "La materia se añadio al grupo correctamente",
    });
  } catch (error) {
    printAndSendError(res, error);
  }
};

const removeCourseGroup = async (req, res) => {
  const { id_group, id_course } = req.params;
  try {
    const gro_cou = await Gro_cou.findOne({
      where: { [Op.and]: [{ id_course }, { id_group }] },
    });
    const cou_tea = await Cou_tea.findOne({
      where: {
        [Op.and]: [
          { id_course },
          { start_date: { [Op.eq]: gro_cou.start_date } },
          { end_date: { [Op.eq]: gro_cou.end_date } },
        ],
      },
    });
    if (!cou_tea) {
      return res.json({
        ok: false,
        msg: `El curso con id ${id_course} no se encuentra asociado con ningun maestro.`,
      });
    }
    await cou_tea.destroy();
    await gro_cou.destroy();
    return res.json({
      ok: true,
      msg: `La asociación entre el grupo con id ${id_group} y el curso con id ${id_course} se ha eliminado correctamente.`,
    });
  } catch (error) {
    printAndSendError(res, error);
  }
};

const getStudentsFromGroup = async (req, res = response) => {
  const { id_group } = req.params;
  try {
    Stu_gro.belongsTo(Student, { foreignKey: "id_student" });
    Student.hasOne(Stu_gro, { foreignKey: "id_student" });

    Stu_gro.belongsTo(Group, { foreignKey: "id_group" });
    Group.hasMany(Stu_gro, { foreignKey: "id_group" });

    let studentsGroup = await Stu_gro.findAll({
      include: [
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
        {
          model: Group,
          attributes: ["id_group", "name_group"],
        },
      ],
      where: { [Op.and]: [{ id_group }, { status: 1 }] },
    });

    studentsGroup = studentsGroup.map((studentGro) => {
      const { student, groupss, ...restoStudentGro } = studentGro.toJSON();
      return {
        ...restoStudentGro,
        ...student,
        ...groupss,
      };
    });

    res.json({
      ok: true,
      students: studentsGroup,
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

const getCoursesGroupHasTaken = async (req, res = response) => {
  const { id_group } = req.params;
  let groupInfo = { ...(await getGroupInfo(id_group)) };
  const gro_cous = await Gro_cou.findAll({ where: { id_group } });
  const coursesId = await Promise.all(
    gro_cous.map(async (gro_cou) => {
      await setCourseInactivate(gro_cou);
      return gro_cou.id_course;
    })
  );
  const coursesTakenByGroup = await Courses.findAll({
    where: { id_course: { [Op.in]: coursesId } },
    raw: true,
    nest: true,
  });
  groupInfo.coursesTaken = await Promise.all(
    coursesTakenByGroup.map(async (course) => {
      const { teacher } = await getTitularTeacherOfCourse(
        id_group,
        course.id_course
      );
      return { ...course, ...teacher };
    })
  );
  const coursesNotTakenByGroup = await Courses.findAll({
    where: {
      [Op.and]: [
        { id_course: { [Op.notIn]: coursesId } },
        { id_major: groupInfo.id_major },
      ],
    },
    raw: true,
    nest: true,
  });
  groupInfo.coursesNotTaken = coursesNotTakenByGroup;
  res.json({
    ok: true,
    group: groupInfo,
  });
};

const assignGroupChief = async (req, res = response) => {
  const { id_group, matricula } = req.params;
  const { id_student } = req;
  try {
    await assingStudentAsGroupChief(id_student, id_group);
    res.json({
      ok: true,
      msg: `El estudiante con matricula ${matricula} fue asignado como jefe de grupo.`,
    });
  } catch (error) {
    printAndSendError(res, error);
  }
};

const removeGroupChief = async (req, res = response) => {
  const { id_group } = req.params;
  try {
    await removeStudentAsGroupChief(id_group);
    res.json({
      ok: true,
      msg: `Jefe de grupo del grupo con id ${id_group} removido correctamente.`,
    });
  } catch (error) {
    printAndSendError(res, error);
  }
};
module.exports = {
  getAllGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  addCourseGroup,
  getStudentsFromGroup,
  removeCourseGroup,
  getCoursesGroupHasTaken,
  assignGroupChief,
  removeGroupChief,
};
