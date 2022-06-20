const { fn, col, Op } = require("sequelize");
const moment = require("moment");
const Course = require("../models/courses");
const Cou_tea = require("../models/cou_tea");
const Grades = require("../models/grades");
const Group = require("../models/group");
const Gro_cou = require("../models/gro_cou");
const Student = require("../models/student");
const Teacher = require("../models/teacher");
const Test = require("../models/test");
const Major = require("../models/major");
const Educational_level = require("../models/educational_level");

const getTestInfo = async (
  forMakingActa = false,
  findOpts = { applied: false },
  order = "desc",
  actaOpts = { id_group: 0, id_course: 0 }
) => {
  Test.belongsTo(Student, { foreignKey: "id_student" });
  Student.hasOne(Test, { foreignKey: "id_student" }); // Test - student
  Test.belongsTo(Gro_cou, { foreignKey: "id_gro_cou" });
  Gro_cou.hasOne(Test, { foreignKey: "id_gro_cou" }); // Test - gro_cou
  Gro_cou.belongsTo(Group, { foreignKey: "id_group" });
  Group.hasOne(Gro_cou, { foreignKey: "id_gro_cou" }); //Gro_cou - group
  Gro_cou.belongsTo(Course, { foreignKey: "id_course" });
  Course.hasOne(Gro_cou, { foreignKey: "id_gro_cou" }); //Gro_cou - course
  Test.belongsTo(Grades, { foreignKey: "id_grade" });
  Grades.hasOne(Test, { foreignKey: "id_grade" }); //Test - grade
  Cou_tea.belongsTo(Teacher, { foreignKey: "id_teacher" });
  Teacher.hasOne(Cou_tea, { foreignKey: "id_teacher" }); //Cou_tea - teacher
  Group.belongsTo(Major, { foreignKey: "id_major" });
  Major.hasOne(Group, { foreignKey: "id_major" }); //Group - major
  Major.belongsTo(Educational_level, { foreignKey: "id_edu_lev" });
  Educational_level.hasOne(Major, { foreignKey: "id_edu_lev" }); //Group - major
  let tests = await Test.findAll({
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
              col("surname_m"),
              " ",
              col("surname_f")
            ),
            "student_name",
          ],
        ],
      },
      {
        model: Gro_cou,
        include: [
          {
            model: Group,
            attributes: ["id_group", "name_group"],
            include: {
              model: Major,
              attributes: [
                "id_major",
                [
                  fn(
                    "concat",
                    col(
                      "gro_cou->groupss->major->educational_level.educational_level"
                    ),
                    " en ",
                    col("gro_cou->groupss->major.major_name")
                  ),
                  "major_name",
                ],
              ],
              include: {
                model: Educational_level,
                attributes: ["educational_level"],
              },
            },
          },
          { model: Course, attributes: ["id_course", "course_name"] },
        ],
        where: forMakingActa ? actaOpts : {},
      },
    ],
    where: forMakingActa
      ? { assigned_test_date: { [Op.not]: null } }
      : { ...findOpts },
    order: [["application_date", `${order}`]],
    raw: true,
    nest: true,
  });
  if (tests.length < 1) return null;
  if (forMakingActa) {
    let { teacher } = await Cou_tea.findOne({
      where: {
        [Op.and]: [
          { start_date: { [Op.eq]: tests[0].gro_cou.start_date } },
          { end_date: { [Op.eq]: tests[0].gro_cou.end_date } },
        ],
      },
      include: {
        model: Teacher,
        attributes: [
          "id_teacher",
          [
            fn(
              "concat",
              col("name"),
              " ",
              col("surname_m"),
              " ",
              col("surname_f")
            ),
            "teacher_name",
          ],
        ],
      },
      raw: true,
      nest: true,
    });
    const { major, ...restGroup } = tests[0].gro_cou.groupss;
    tests = {
      ...restGroup,
      major_name: tests[0].gro_cou.groupss.major.major_name,
      ...tests[0].gro_cou.course,
      ...teacher,
      tests: tests.map(({ major, gro_cou, student, ...test }) => ({
        ...test,
        ...student,
      })),
    };
  } else {
    tests = tests.map(({ gro_cou, student, ...rest }) => {
      const {
        groupss: { major, ...restGroup },
        course,
      } = gro_cou;
      return {
        ...rest,
        ...student,
        ...restGroup,
        major_name: major.major_name,
        ...course,
      };
    });
  }
  return tests;
};

module.exports = getTestInfo;
