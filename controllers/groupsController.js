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
  hasGroupAGroupChief,
  getStudentsFromGroup,
} = require("../helpers/groups");
const { setCourseInactivate } = require("../helpers/courses");
const Cam_gro = require("../models/cam_gro");
const Campus = require("../models/campus");
const {
  getGroupDaysAndOverdue,
  findAssistenceDays,
} = require("../helpers/dates");
const Gro_cou_ass = require("../models/gro_cou_ass");
const {
  getGroupsInfoWithTimeTable,
} = require("../helpers/getDataSavedFromEntities");
const Grades = require("../models/grades");
const Test = require("../models/test");
const Gro_tea_cou = require("../models/gro_tea_cou");

const getAllGroups = async (req, res) => {
  try {
    const groups = await getGroupsInfoWithTimeTable();
    res.json({
      ok: true,
      groups,
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

const createGroup = async (req, res) => {
  const {
    id_major,
    group_name: name_group,
    entry_year,
    end_year,
    time_table,
    id_campus,
  } = req.body;
  let id_time_table;
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
    const group = await Group.create({
      id_major: major.id_major,
      name_group,
      entry_year,
      end_year,
    });
    const { id_group } = group;
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
    const result = await getGroupsInfoWithTimeTable(id_group);
    res.status(201).json({
      ok: true,
      msg: "Grupo creado correctamente",
      result,
    });
  } catch (error) {
    printAndSendError(res, error);
  }
};

const updateGroup = async (req, res) => {
  const { id_group } = req.params;
  const {
    group_name: name_group = "",
    id_campus,
    id_major,
    entry_year,
    end_year,
    time_table,
  } = req.body;
  try {
    const group = await Group.findByPk(id_group);
    const campus = await Campus.findByPk(id_campus);
    if (!campus)
      return res.status(404).json({
        ok: false,
        msg: `Campus con id ${id_campus} no encontrado.`,
      });
    await Cam_gro.update({ id_campus }, { where: { id_group } });
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
    await group.update({ name_group, id_major, entry_year, end_year });
    // Actualizar el horario del grupo
    const groupTimeTable = await Time_tables.findAll({
      where: {
        id_time_table: {
          [Op.in]: literal(
            `(SELECT id_time_table FROM gro_tim WHERE id_group = '${id_group}')`
          ),
        },
      },
      nest: false,
      raw: true,
    });
    await Promise.all(
      time_table.map(async (req_time_table) => {
        const current_time_table = groupTimeTable.find(
          (time_table) => time_table.day === req_time_table.day
        );
        if (current_time_table) {
          if (
            current_time_table.start_hour === req_time_table.start_hour &&
            current_time_table.start_hour === req_time_table.start_hour
          )
            return;
          await Gro_tim.destroy({
            where: {
              id_time_table: current_time_table.id_time_table,
              id_group,
            },
          });
        }

        const possible_time_table = await Time_tables.findOne({
          where: {
            day: req_time_table.day,
            start_hour: req_time_table.start_hour,
            finish_hour: req_time_table.finish_hour,
          },
        });
        if (possible_time_table) {
          await Gro_tim.create({
            id_group,
            id_time_table: possible_time_table.id_time_table,
          });
        } else {
          const { id_time_table } = await Time_tables.create({
            day: req_time_table.day,
            start_hour: req_time_table.start_hour,
            finish_hour: req_time_table.finish_hour,
          });
          await Gro_tim.create({
            id_group,
            id_time_table,
          });
        }
      }),
      groupTimeTable.map(async (time_table_db) => {
        const time_table_days = time_table.map((time_table) => time_table.day);
        if (!time_table_days.includes(time_table_db.day)) {
          await Gro_tim.destroy({
            where: {
              id_time_table: time_table_db.id_time_table,
              id_group,
            },
          });
        }
      })
    );
    const result = await getGroupsInfoWithTimeTable(group.id_group);
    res.status(200).json({
      ok: true,
      msg: "El grupo se actualizo correctamente",
      result,
    });
  } catch (error) {
    printAndSendError(res, error);
  }
};

const deleteGroup = async (req, res) => {
  const { id_group } = req.params;
  try {
    const group = await Group.findByPk(id_group);
    const studentFromGroup = await Stu_gro.findAndCountAll({
      where: { [Op.and]: [{ id_group }] },
    });
    if (studentFromGroup.count > 0) {
      return res.status(400).json({
        ok: false,
        msg: "Existen alumnos relacionados al grupo, remuevalos del grupo antes de eliminar el grupo.",
      });
    }
    const gro_tim = await Gro_tim.findAll({
      where: { id_group },
    });
    gro_tim.forEach(async (grupo) => {
      await grupo.destroy();
    });
    await Cam_gro.destroy({ where: { id_group } });
    const gro_cous = await Gro_cou.findAll({ where: { id_group } });
    await Promise.all(
      gro_cous.map(async (gro_cou) => {
        await Cou_tea.destroy({
          where: {
            [Op.and]: [
              { start_date: gro_cou.start_date },
              { end_date: gro_cou.end_date },
              { id_course: gro_cou.id_course },
            ],
          },
        });
        await Gro_cou_ass.destroy({
          where: { id_gro_cou: gro_cou.id_gro_cou },
        });
        await gro_cou.destroy();
      })
    );
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
    const groupCourseSameMonth = await Gro_cou.findAll({
      where: {
        [Op.and]: [
          {
            id_group,
          },
        ],
      },
    });
    // Validate that a group can't take more than a course in a period
    if (
      groupCourseSameMonth.find(
        (gro_cou) =>
          (moment(gro_cou.start_date).month() === moment(start_date).month() &&
            moment(gro_cou.start_date).year() === moment(start_date).year()) ||
          (moment(gro_cou.end_date).month() === moment(start_date).month() &&
            moment(gro_cou.end_date).year() === moment(start_date).year() &&
            moment(start_date).date() < moment(gro_cou.end_date).date())
      )
    ) {
      return res.status(400).json({
        ok: false,
        msg: `El grupo ya cuenta con una materia asignada para el periodo especificado`,
      });
    }
    const { id_gro_cou } = await Gro_cou.create({
      id_group,
      id_course,
      start_date,
      end_date,
    });
    const { id_sub_tea: id_cou_tea } = await Cou_tea.create({
      id_course,
      id_teacher,
      start_date,
      end_date,
    });
    await Gro_tea_cou.create({ id_gro_cou, id_cou_tea });
    const studentsFromGroup = (await getStudentsFromGroup(id_group)).map(
      ({ id_student }) => id_student
    );

    for (const id_student of studentsFromGroup) {
      const studentGradeWithCourse = await Grades.findOne({
        where: { [Op.and]: [{ id_student }, { id_course }] },
      });
      if (!studentGradeWithCourse) {
        const { id_grade } = await Grades.create({
          id_course,
          id_student,
          grade: "-",
        });
        const last_folio =
          (
            await Test.findOne({
              order: [["folio", "desc"]],
            })
          )?.folio || 0;
        const testGrade = new Test({
          id_student,
          id_gro_cou,
          folio: last_folio + 1,
          type: "Ordinario",
          application_date: moment().format("YYYY-MM-DD"),
          assigned_test_date: null,
          applied: false,
          id_grade: id_grade,
        });
        await testGrade.save();
      } else if (studentGradeWithCourse.grade === "NP") {
        await Test.update(
          { id_gro_cou },
          { where: { id_grade: studentGradeWithCourse.id_grade } }
        );
      }
    }

    res.status(200).json({
      ok: true,
      msg: "La materia se añadio al grupo correctamente",
    });
  } catch (error) {
    printAndSendError(res, error);
  }
};

const removeCourseGroup = async (req, res) => {
  Test.belongsTo(Grades, { foreignKey: "id_grade" });
  Grades.hasOne(Test, { foreignKey: "id_grade" });
  const { id_group, id_course } = req.params;
  try {
    const gro_cou = await Gro_cou.findOne({
      where: { [Op.and]: [{ id_course }, { id_group }] },
    });
    const gro_tea_cou = await Gro_tea_cou.findOne({
      where: { id_gro_cou: gro_cou.id_gro_cou },
    });
    const cou_tea = await Cou_tea.findOne({
      where: { id_sub_tea: gro_tea_cou.id_cou_tea },
    });
    if (!cou_tea) {
      return res.json({
        ok: false,
        msg: `El curso con id ${id_course} no se encuentra asociado con ningun maestro.`,
      });
    }
    await gro_tea_cou.destroy();
    // const studentsFromGroup = (await getStudentsFromGroup(id_group)).map(
    //   ({ id_student }) => id_student
    // );
    const grades = await Grades.findAll({
      include: {
        required: true,
        model: Test,
        where: { id_gro_cou: gro_cou.id_gro_cou },
      },
    });
    await Promise.all(
      grades.map(async (grade) => {
        await Test.destroy({ where: { id_grade: grade.id_grade } });
        await grade.destroy();
      })
      // if (grade) {
      //   await Test.destroy({ where: { id_grade: grade.id_grade } });
      //   await grade.destroy();
      // }
      // })
    );
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

const getCoursesAGroupCanTake = async (req, res) => {
  const { id_group } = req.params;
  try {
    const [groupInfo] = await getGroupInfo(id_group);
    console.log(groupInfo);
    let coursesCanTake = await Courses.findAll({
      where: { id_major: groupInfo.id_major },
    });
    const coursesAGroupHasTaken = await Gro_cou.findAll({
      where: { id_group },
    });
    coursesCanTake = coursesCanTake.filter((course) => {
      const coursesIdTaken = coursesAGroupHasTaken.map(
        (courseHasTaken) => courseHasTaken.id_course
      );
      return !coursesIdTaken.includes(course.id_course) ? true : false;
    });
    res.json({
      ok: true,
      courses: coursesCanTake,
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

const assignGroupChief = async (req, res = response) => {
  const { id_group, matricula } = req.params;
  const { id_student } = req;
  try {
    const group_chief_id_student = await hasGroupAGroupChief(id_group);
    if (!group_chief_id_student) {
      await assingStudentAsGroupChief(id_student, id_group);
      return res.json({
        ok: true,
        msg: `El estudiante con matricula ${matricula} fue asignado como jefe de grupo.`,
      });
    }
    return res.status(400).json({
      ok: false,
      msg: `El grupo con id ${id_group} ya cuenta con un jefe de grupo`,
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

const getCoursesGroupHasTaken = async (req, res = response) => {
  const { id_group } = req.params;
  let groupInfo = { ...(await getGroupInfo(id_group))[0] };
  const gro_cous = await Gro_cou.findAll({
    where: { id_group },
    order: [["start_date", "asc"]],
  });
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
  groupInfo.courses_taken = await Promise.all(
    coursesTakenByGroup.map(async (course) => {
      const { teacher } = await getTitularTeacherOfCourse(
        id_group,
        course.id_course
      );
      return { ...course, ...teacher };
    })
  );
  // const coursesNotTakenByGroup = await Courses.findAll({
  //   where: {
  //     [Op.and]: [
  //       { id_course: { [Op.notIn]: coursesId } },
  //       { id_major: groupInfo.id_major },
  //     ],
  //   },
  //   raw: true,
  //   nest: true,
  // });
  // groupInfo.coursesNotTaken = coursesNotTakenByGroup;
  res.json({
    ok: true,
    group: groupInfo,
  });
};

module.exports = {
  getAllGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  addCourseGroup,
  removeCourseGroup,
  assignGroupChief,
  removeGroupChief,
  getCoursesAGroupCanTake,
  getCoursesGroupHasTaken,
};
