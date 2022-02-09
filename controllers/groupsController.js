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
} = require("../helpers/groups");
const { setCourseInactivate } = require("../helpers/courses");
const Cam_gro = require("../models/cam_gro");
const Campus = require("../models/campus");
const {
  getGroupDaysAndOverdue,
  findAssistanceDays,
} = require("../helpers/dates");

const getAllGroups = async (req, res) => {
  const { timeTable = false } = req.query;
  let groups = [];
  try {
    groups = await getGroupInfo();
    if (timeTable) {
      groups = await Promise.all(
        groups.map(async (group) => {
          const gro_tim = await Gro_tim.findAll({
            where: { id_group: group.id_group },
            attributes: ["id_time_table"],
          });
          const time_tables = await Time_tables.findAll({
            where: {
              id_time_table: {
                [Op.in]: gro_tim.map(
                  (time_table) => time_table.toJSON().id_time_table
                ),
              },
            },
            attributes: { exclude: ["id_time_table"] },
          });
          return {
            ...group,
            time_table: time_tables.map((time_table) => time_table.toJSON()),
          };
        })
      );
    }
    res.json({
      ok: true,
      groups,
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

const createGroup = async (req, res) => {
  const { id_major, name_group, entry_year, end_year, time_tables, id_campus } =
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

    ids_emp_tim = time_tables.map(async (x) => {
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
    const stu_gro = await Stu_gro.findAll({
      where: { id_group },
    });
    stu_gro.forEach(async (grupo) => {
      await grupo.destroy();
    });
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

  try {
    const groupCourse = await Gro_cou.findOne({
      where: {
        id_course,
        id_group: { [Op.ne]: id_group },
      },
    });
    if (groupCourse) {
      return res.status(400).json({
        ok: false,
        msg: `Ya existe una materia en ese grupo con el id ${id_course}`,
      });
    }
    const { first_day: start_date, last_day: end_date } =
      await getGroupDaysAndOverdue(id_group, {});
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
      where: { id_group },
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
  const groupInfo = { ...(await getGroupInfo(id_group)) };
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
  res.json({
    ok: true,
    group: groupInfo,
  });
};

const getAssistanceDays = async (req, res = response) => {
  const { id_group } = req.params;
  Gro_tim.belongsTo(Time_tables, { foreignKey: "id_time_table" });
  Time_tables.hasMany(Gro_tim, { foreignKey: "id_time_table" });
  let assistance_days = await Time_tables.findAll({
    where: {
      id_time_table: {
        [Op.in]: literal(
          `(SELECT id_time_table FROM gro_tim WHERE id_group = ${id_group})`
        ),
      },
    },
    attributes: ["day"],
    order: [[col("day"), "asc"]],
  });
  assistance_days = assistance_days.map(({ day }) => day);
  let { first_day, last_day } = await getGroupDaysAndOverdue(id_group, {});
  let assistance_days_dates = findAssistanceDays(
    assistance_days,
    first_day,
    last_day
  );
  res.json({ assistance_days_dates });
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
  getAssistanceDays,
};
