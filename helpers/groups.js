const { literal, fn, col, Op, where } = require("sequelize");
const Campus = require("../models/campus");
const Cam_gro = require("../models/cam_gro");
const Cam_use = require("../models/cam_use");
const Course = require("../models/courses");
const Cou_tea = require("../models/cou_tea");
const Educational_level = require("../models/educational_level");
const Grades = require("../models/grades");
const Group = require("../models/group");
const Gro_cou = require("../models/gro_cou");
const Major = require("../models/major");
const Student = require("../models/student");
const Stu_gro = require("../models/stu_gro");
const Teacher = require("../models/teacher");
const User = require("../models/user");
const { setCourseInactivate } = require("./courses");

const getGroupInfo = async (id_group) => {
  Cam_gro.belongsTo(Group, { foreignKey: "id_group" });
  Group.hasOne(Cam_gro, { foreignKey: "id_group" });
  Cam_gro.belongsTo(Campus, { foreignKey: "id_campus" });
  Campus.hasOne(Cam_gro, { foreignKey: "id_campus" });
  Group.belongsTo(Major, { foreignKey: "id_major" });
  Major.hasOne(Group, { foreignKey: "id_major" });
  Major.belongsTo(Educational_level, { foreignKey: "id_edu_lev" });
  Educational_level.hasOne(Major, { foreignKey: "id_edu_lev" });
  Group.belongsTo(Student, { foreignKey: "group_chief_id_student" });
  Student.hasOne(Group, { foreignKey: "group_chief_id_student" });
  let groups = await Group.findAll({
    attributes: {
      include: [["name_group", "group_name"]],
      exclude: ["name_group"],
    },
    include: [
      {
        model: Cam_gro,
        include: { model: Campus, attributes: ["id_campus", "campus_name"] },
      },
      {
        model: Major,
        attributes: [
          [
            fn(
              "concat",
              col("major.educational_level.educational_level"),
              " en ",
              col("major_name")
            ),
            "major_name",
          ],
        ],
        include: { model: Educational_level, attributes: [] },
      },
      {
        model: Student,
        attributes: [
          ["matricula", "group_chief_matricula"],
          [
            fn(
              "concat",
              col("student.name"),
              " ",
              col("student.surname_m"),
              " ",
              col("student.surname_f")
            ),
            "group_chief_student_name",
          ],
        ],
      },
    ],
    where: id_group ? { id_group } : undefined,
  });
  groups = groups.map((group) => {
    let {
      major,
      cam_gro: { campus },
      student,
      ...restGroupInfo
    } = group.toJSON();
    return { ...campus, ...major, ...restGroupInfo, ...student };
  });
  return groups;
};

const getTitularTeacherOfCourse = async (id_group = 0, id_course = 0) => {
  // Gro_cou.belongsTo(Course,{foreignKey:'id_course'})
  // Course.hasOne(Gro_cou,{foreignKey:'id_course'})
  // Cou_tea.belongsTo(Course,{foreignKey:'id_course'})
  // Course.hasOne(Cou_tea,{foreignKey:'id_course'})
  Cou_tea.belongsTo(Teacher, { foreignKey: "id_teacher" });
  Teacher.hasOne(Cou_tea, { foreignKey: "id_teacher" });
  const course = await Cou_tea.findOne({
    // where : {[Op.and] : [{id_course},{id_group}]},

    include: {
      model: Teacher,
      attributes: [
        "id_teacher",
        [
          fn(
            "concat",
            col("name"),
            " ",
            col("surname_f"),
            " ",
            col("surname_m")
          ),
          "teacher_name",
        ],
      ],
    },
    where: where(
      literal(
        `((${
          col("start_date").col
        } = (SELECT start_date FROM gro_cou WHERE id_course = ${id_course} AND id_group = ${id_group})) AND (${
          col("end_date").col
        } = (SELECT end_date FROM gro_cou WHERE id_course = ${id_course} AND id_group = ${id_group})) AND ${
          col("id_course").col
        } = ${id_course})`
      ),
      true
    ),
    raw: true,
    nest: true,
  });
  return course;
};

const assingStudentAsGroupChief = async (id_student, id_group) => {
  const group = await Group.findByPk(id_group);
  group.update({ group_chief_id_student: id_student });
};
const removeStudentAsGroupChief = async (id_group) => {
  const group = await Group.findByPk(id_group);
  group.update({ group_chief_id_student: null });
};
const hasGroupAGroupChief = async (id_group) => {
  const group = await Group.findByPk(id_group);
  if (group.group_chief_id_student) return group.group_chief_id_student;
  return false;
};

const isStudentGroupChiefOfGroup = async (
  id_student,
  opts = { excludeCurrentStudentGroup: false }
) => {
  const { excludeCurrentStudentGroup } = opts;
  let currentStudentGroup = await Stu_gro.findOne({
    where: { [Op.and]: [{ id_student }, { status: 1 }] },
  });
  const { id_group } = currentStudentGroup;
  const groupsStudentIsChief = await Group.findAndCountAll({
    where: {
      [Op.and]: [
        { group_chief_id_student: id_student },
        excludeCurrentStudentGroup
          ? { id_group: { [Op.ne]: id_group } }
          : undefined,
      ],
    },
  });
  return groupsStudentIsChief.count > 0;
};

const studentGroupBelongsSameMajor = async (id_student, id_group) => {
  Stu_gro.belongsTo(Group, { foreignKey: "id_group" });
  Group.hasOne(Stu_gro, { foreignKey: "id_group" });
  // Find student's current group and major
  const stu_gro = await Stu_gro.findOne({
    include: { model: Group, attributes: ["id_major", "id_group"] },
    where: { [Op.and]: [{ id_student }, { status: 1 }] },
    order: [["id_stu_gro", "desc"]],
  });
  const {
    groupss: { id_major: id_current_major, id_group: id_current_group },
  } = stu_gro.toJSON();
  const { id_major } = await Group.findByPk(id_group);
  return id_current_major === id_major;
};

const getGroupCoursesTrack = async (id_group) => {
  let groupInfo = { ...(await getGroupInfo(id_group))[0] };
  const groupStudents = await Stu_gro.findAll({
    where: { id_group, status: 1 },
  });
  const gro_cous = await Gro_cou.findAll({ where: { id_group } });
  let coursesId = await Promise.all(
    gro_cous.map(async (gro_cou) => {
      gro_cou = await setCourseInactivate(gro_cou);
      if (!gro_cou.status) return null;
      // const gradeStudentsGroup = await Grades.findAll({
      //   where: {
      //     [Op.and]: [
      //       {
      //         id_student: {
      //           [Op.in]: groupStudents.map(
      //             (groupStudent) => groupStudent.toJSON().id_student
      //           ),
      //         },
      //       },
      //       { id_course: gro_cou.id_course },
      //       { creation_date: { [Op.gte]: gro_cou.start_date } },
      //       { creation_date: { [Op.lte]: gro_cou.end_date } },
      //     ],
      //   },
      // });
      // return gradeStudentsGroup.length < groupStudents.length
      //   ? null
      //   : gro_cou.id_course;
    })
  );
  coursesId = coursesId.filter((course) => course);
  let coursesTakenByGroup = await Course.findAll({
    where: { id_course: { [Op.in]: coursesId } },
    raw: true,
    nest: true,
  });
  coursesTakenByGroup = await Promise.all(
    coursesTakenByGroup.map(async (course) => {
      const { teacher } = await getTitularTeacherOfCourse(
        id_group,
        course.id_course
      );
      return { ...course, ...teacher, isTaken: true };
    })
  );
  let coursesNotTakenByGroup = await Course.findAll({
    where: {
      [Op.and]: [
        { id_course: { [Op.notIn]: coursesId } },
        { id_major: groupInfo.id_major },
      ],
    },
    raw: true,
    nest: true,
  });
  coursesNotTakenByGroup = coursesNotTakenByGroup.map((course) => ({
    ...course,
    isTaken: false,
  }));
  groupInfo["courses"] = [...coursesTakenByGroup, ...coursesNotTakenByGroup];
  return groupInfo;
};
module.exports = {
  getGroupInfo,
  getTitularTeacherOfCourse,
  assingStudentAsGroupChief,
  removeStudentAsGroupChief,
  hasGroupAGroupChief,
  isStudentGroupChiefOfGroup,
  studentGroupBelongsSameMajor,
  getGroupCoursesTrack,
};
