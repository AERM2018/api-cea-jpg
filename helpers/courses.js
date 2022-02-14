const { fn, col, Op, where, literal } = require("sequelize");
const moment = require("moment");
const Course = require("../models/courses");
const Cou_tea = require("../models/cou_tea");
const Educational_level = require("../models/educational_level");
const ExtraCurricularCourses = require("../models/extracurricularcourses");
const Graduation_courses = require("../models/graduation_courses");
const Graduation_section = require("../models/graduation_section");
const Group = require("../models/group");
const Gro_cou = require("../models/gro_cou");
const Major = require("../models/major");
const Teacher = require("../models/teacher");
const Time_tables = require("../models/time_tables");

const getRegularCourseInfo = async (
  opts = { id_gro_cou: 0, addTeacher: false }
) => {
  const { id_gro_cou, addTeacher } = opts;
  // Buscar información acerca del curso
  Gro_cou.belongsTo(Group, { foreignKey: "id_group" });
  Group.hasOne(Gro_cou, { foreignKey: "id_group" });
  // const getRegularCourseInfo = async (id_gro_cou) => {
  //   // Buscar información acerca del curso
  //   Gro_cou.belongsTo(Group, { foreignKey: "id_group" });
  //   Group.hasOne(Gro_cou, { foreignKey: "id_group" });

  Gro_cou.belongsTo(Course, { foreignKey: "id_course" });
  Course.hasMany(Gro_cou, { foreignKey: "id_course" });

  Cou_tea.belongsTo(Course, { foreignKey: "id_course" });
  Course.hasOne(Cou_tea, { foreignKey: "id_course" });

  Cou_tea.belongsTo(Teacher, { foreignKey: "id_teacher" });
  Teacher.hasOne(Cou_tea, { foreignKey: "id_teacher" });

  Group.belongsTo(Major, { foreignKey: "id_major" });
  Major.hasOne(Group, { foreignKey: "id_major" });

  Major.belongsTo(Educational_level, { foreignKey: "id_edu_lev" });
  Educational_level.hasOne(Major, { foreignKey: "id_edu_lev" });
  let course = await Gro_cou.findOne({
    include: [
      {
        model: Group,
        attributes: {
          include: [["name_group", "group_name"]],
          exclude: ["name_group", "entry_year", "end_year"],
        },
        include: {
          model: Major,
          attributes: [
            [
              fn(
                "concat",
                col("groupss.major->educational_level.educational_level"),
                " en ",
                col("groupss.major.major_name")
              ),
              "major_name",
            ],
          ],
          include: { model: Educational_level },
        },
      },
      {
        model: Course,
        ...(addTeacher && {
          include: {
            model: Cou_tea,
            include: {
              model: Teacher,
              attributes: [
                "id_teacher",
                [
                  fn(
                    "concat",
                    col("course.cou_tea.teacher.name"),
                    " ",
                    col("course.cou_tea.teacher.surname_f"),
                    " ",
                    col("course.cou_tea.teacher.surname_m")
                  ),
                  "teacher_name",
                ],
              ],
            },
          },
        }),
      },
    ],
    where: { id_gro_cou },
  });
  course = await setCourseInactivate(course, "regular");
  let {
    id_course,
    id_group,
    groupss: {
      major: { major_name },
      ...restGroup
    },
    course: { course_name, cou_tea },
    ...restCourse
  } = course.toJSON();

  return {
    id_course,
    course_name,
    id_group,
    ...restGroup,
    major_name,
    ...restCourse,
    ...(addTeacher && cou_tea.teacher),
  };
};

const getExtraCourseInfo = async (
  opts = {
    id_ext_cou: undefined,
    addTeacher: false,
    teacherName: "",
    id_teacher: undefined,
    courseName: "",
    status: undefined,
  }
) => {
  ExtraCurricularCourses.belongsTo(Major, { foreignKey: "id_major" });
  Major.hasOne(ExtraCurricularCourses, { foreignKey: "id_major" });
  ExtraCurricularCourses.belongsTo(Teacher, { foreignKey: "id_teacher" });
  Teacher.hasOne(ExtraCurricularCourses, { foreignKey: "id_teacher" });
  Major.belongsTo(Educational_level, { foreignKey: "id_edu_lev" });
  Educational_level.hasOne(Major, { foreignKey: "id_edu_lev" });
  ExtraCurricularCourses.belongsTo(Time_tables, {
    foreignKey: "id_time_table",
  });
  Time_tables.hasMany(ExtraCurricularCourses, { foreignKey: "id_time_table" });

  const {
    id_ext_cou,
    addTeacher,
    teacherName,
    id_teacher,
    courseName,
    status,
  } = opts;
  let includeOpts = {
    include: [
      {
        model: Major,
        attributes: [
          [
            fn(
              "concat",
              col("major->educational_level.educational_level"),
              " en ",
              col("major.major_name")
            ),
            "major_name",
          ],
        ],
        include: {
          model: Educational_level,
        },
      },
      { model: Time_tables },
    ],
  };
  if (addTeacher)
    includeOpts.include.push({
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
      where: teacherName
        ? where(
            literal(
              `(CONCAT(LOWER(name),' ',LOWER(surname_f),' ',LOWER(surname_m)))`
            ),
            { [Op.like]: `%${teacherName}%` }
          )
        : undefined,
    });
  let extraCourses = await ExtraCurricularCourses.findAll({
    ...includeOpts,
    where: {
      [Op.and]: [
        ...(courseName
          ? [{ ext_cou_name: { [Op.like]: `%${courseName}%` } }]
          : []),
        ...(status != undefined ? [{ status }] : []),
        ...(id_ext_cou ? [{ id_ext_cou }] : []),
        ...(id_teacher ? [{ id_teacher }] : []),
      ],
    },
    attributes: {
      include: [
        ["ext_cou_name", "course_name"],
        [
          literal(
            `(limit_participants - (SELECT COUNT(*) FROM stu_extracou WHERE stu_extracou.id_ext_cou = id_ext_cou))`
          ),
          "spot_left",
        ],
      ],
      exclude: ["ext_cou_name"],
    },
  });
  extraCourses = Promise.all(
    extraCourses.map(async (extraCourse) => {
      extraCourse = await setCourseInactivate(extraCourse, "extracurricular");
      let {
        teacher,
        major: { major_name },
        ...restExtraCourse
      } = extraCourse.toJSON();
      return { ...restExtraCourse, major_name, ...(addTeacher && teacher) };
    })
  );
  return extraCourses;
};

const getGraduationSectionInfo = async (id_graduation_section) => {
  Graduation_section.belongsTo(Teacher, { foreignKey: "id_teacher" });
  Teacher.hasOne(Graduation_section, { foreignKey: "id_teacher" });
  Graduation_section.belongsTo(Graduation_courses, {
    foreignKey: "id_graduation_course",
  });
  Graduation_courses.hasOne(Graduation_section, {
    foreignKey: "id_graduation_course",
  });

  let graduationSection = await Graduation_section.findOne({
    include: [
      {
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
      {
        model: Graduation_courses,
      },
    ],
    where: { id_graduation_section },
    raw: true,
    nest: true,
  });

  let {
    id_teacher,
    id_graduation_course,
    graduation_course,
    teacher,
    ...restGraduationSection
  } = graduationSection;
  return { ...restGraduationSection, ...graduation_course, ...teacher };
};

const getGraduationCourseInfo = async (id_graduation_course) => {
  // Graduation_section.belongsTo(Teacher,{foreignKey:'id_teacher'})
  // Teacher.hasOne(Graduation_section,{foreignKey:'id_teacher'})
  // Graduation_section.belongsTo(Graduation_courses,{foreignKey:'id_graduation_course'})
  // Graduation_courses.hasOne(Graduation_section,{foreignKey:'id_graduation_course'})

  let graduationCourse = await Graduation_courses.findOne({
    // include : [{
    //   model:Teacher,
    //   attributes : ['id_teacher',[fn('concat',col('name'),' ',col('surname_f'),' ',col('surname_m')),'teacher_name']]
    // },{
    //   model : Graduation_courses
    // }],
    attributes: ["course_grad_name", "course_name"],
    where: { id_graduation_course },
  });
  graduationCourse = setCourseInactivate(graduationCourse, "graduation");

  // let {id_teacher,id_graduation_course,graduation_course,teacher,...restGraduationSection} = graduationSection
  // return {...restGraduationSection,...graduation_course,...teacher};
  return graduationCourse.toJSON();
};

const setCourseInactivate = async (entity, type = "regular") => {
  const { start_date, end_date, status } = entity.toJSON();
  let searchBy;
  if (entity.toJSON().id_course) {
    searchBy = { id_course: entity.toJSON().id_course };
  } else if (entity.toJSON().id_ext_cou) {
    searchBy = { id_ext_cou: entity.toJSON().id_ext_cou };
  } else if (entity.toJSON().id_graduation_course) {
    searchBy = { id_graduation_course: entity.toJSON().id_graduation_course };
  }
  if (moment(end_date).isBefore(moment({})) && status) {
    if (type === "regular") {
      // When a record in gro_cou is overdue, set status = 0 the records with the same dates in cou_tea
      const cou_tea = await Cou_tea.findOne({
        where: {
          [Op.and]: [
            { id_course: searchBy.id_course },
            { start_date: { [Op.eq]: start_date } },
            { end_date: { [Op.eq]: end_date } },
          ],
        },
      });
      await cou_tea.update({ status: 0 });
    } else if (!["extracurricular", "graduation"].includes(type)) {
      throw Error("Tipo de curso desconocido, verifiquelo por favor.");
    }
    await entity.update({ status: 0 }, { searchBy });
    entity.status = 0;
  }
  return entity;
};

const setSectionInactivate = async (section) => {
  if (moment(section.end_date).isBefore(moment({})) && section.in_progress) {
    await section.update({ in_progress: 0 });
    section.in_progress = 0;
  }
  return section;
};

const getCoursesGiveTeachersOrTeacher = async (
  query = { courseName, teacherName, id_teacher, status: "" }
) => {
  const { courseName, teacherName = "", id_teacher, status } = query;
  const statusCondition = status == "all" ? {} : { status };
  const withTeacher = id_teacher == undefined ? true : false;
  const teacherAssosiation = {
    model: Teacher,
    attributes: [
      "id_teacher",
      [
        fn(
          "CONCAT",
          col("teacher.name"),
          " ",
          col("teacher.surname_f"),
          " ",
          col("teacher.surname_m")
        ),
        "teacher_name",
      ],
    ],
    where: where(
      literal(
        `(CONCAT(LOWER(${col("teacher.name").col}),' ', LOWER(${
          col("teacher.surname_f").col
        }),' ', LOWER(${col("teacher.surname_m").col})))`
      ),
      { [Op.like]: `%${teacherName}%` }
    ),
  };
  // Regular courses
  Cou_tea.belongsTo(Teacher, { foreignKey: "id_teacher" });
  Teacher.hasOne(Cou_tea, { foreignKey: "id_teacher" });
  Cou_tea.belongsTo(Course, { foreignKey: "id_course" });
  Course.hasOne(Cou_tea, { foreignKey: "id_course" });
  let coursesTeacherGiven = await Cou_tea.findAll({
    include: [
      {
        model: Course,
        attributes: ["course_name"],
        where: { course_name: { [Op.like]: `%${courseName}%` } },
      },
      ...(withTeacher ? [teacherAssosiation] : []),
    ],
    attributes: ["id_course", "status", "start_date", "end_date"],
    where: { ...(id_teacher ? { id_teacher } : {}) },
  });

  coursesTeacherGiven = await Promise.all(
    coursesTeacherGiven.map(async (course) => {
      const { id_course, start_date, end_date, teacher, ...restoCourse } =
        course.toJSON();
      const gro_cou = await Gro_cou.findOne({
        where: {
          id_course,
          start_date,
          end_date,
          ...statusCondition,
        },
      });
      if (!gro_cou) return;
      let courseData = await getRegularCourseInfo({
        id_gro_cou: gro_cou.id_gro_cou,
      });
      if (withTeacher) courseData = { ...courseData, ...teacher };
      courseData.start_date = moment(courseData.start_date).format(
        "D-MMM-YYYY"
      );
      courseData.end_date = moment(courseData.end_date).format("D-MMM-YYYY");
      courseData.type = "Regular";
      return courseData;
    })
  );
  coursesTeacherGiven = coursesTeacherGiven.filter((course) => course);
  // Extracurricular courses
  let extraCoursesInfo = await getExtraCourseInfo({
    id_teacher,
    courseName,
    status: statusCondition.status,
  });
  extraCoursesInfo = extraCoursesInfo.map((extraCourse) => ({
    type: "Extracurricular",
    start_date: (extraCourse.start_date = moment(extraCourse.start_date).format(
      "D-MMM-YYYY"
    )),
    end_date: (extraCourse.end_date = moment(extraCourse.end_date).format(
      "D-MMM-YYYY"
    )),
    ...extraCourse,
  }));
  // // Graduation courses
  Graduation_section.belongsTo(Graduation_courses, {
    foreignKey: "id_graduation_course",
  });
  Graduation_courses.hasMany(Graduation_section, {
    foreignKey: "id_graduation_course",
  });
  Graduation_section.belongsTo(Teacher, { foreignKey: "id_teacher" });
  Teacher.hasOne(Graduation_section, { foreignKey: "id_teacher" });
  Graduation_courses.belongsTo(Teacher, { foreignKey: "id_teacher" });
  Teacher.hasOne(Graduation_courses, { foreignKey: "id_teacher" });
  let gradCoursesTeacherGiven = await Graduation_courses.findAll({
    include: [
      {
        model: Graduation_section,
        attributes: { exclude: ["id_graduation_course"] },
        where: {
          [Op.and]: [
            ...(id_teacher ? [{ id_teacher }] : []),
            ...(statusCondition == {}
              ? [{ in_progress: statusCondition.status }]
              : []),
          ],
        },
        required: false,
        ...(withTeacher ? [{ include: teacherAssosiation }] : []),
        include: {
          model: Teacher,
          attributes: [
            "id_teacher",
            [
              fn(
                "concat",
                col("graduation_sections.teacher.name"),
                " ",
                col("graduation_sections.teacher.surname_f"),
                " ",
                col("graduation_sections.teacher.surname_m")
              ),
              "teacher_name",
            ],
          ],
        },
      },
      ...[teacherAssosiation],
    ],
    where: {
      [Op.and]: [
        ...(courseName
          ? [{ course_grad_name: { [Op.like]: `%${courseName}%` } }]
          : []),
        ...(status != "all" ? [{ status }] : []),
      ],
    },
    attributes: {
      include: [["course_grad_name", "course_name"]],
      exclude: ["course_grad_name"],
    },
  });
  gradCoursesTeacherGiven = await Promise.all(
    gradCoursesTeacherGiven.map(async (course) => {
      let { teacher, ...coursesInfoJSON } = course.toJSON();
      coursesInfoJSON.graduation_sections = await Promise.all(
        course.graduation_sections.map(async (section) => {
          section = await setSectionInactivate(section);
          if (status == 1 && !section.in_progress) return;
          const { teacher, ...sectionInfo } = section.toJSON();
          return { ...sectionInfo, ...teacher };
        })
      );
      if (id_teacher) {
        if (
          teacher.id_teacher != id_teacher &&
          !coursesInfoJSON.graduation_sections.some(
            (section) => section.id_teacher == id_teacher
          )
        )
          return;
      }
      coursesInfoJSON.graduation_sections =
        coursesInfoJSON.graduation_sections.filter((section) => section);
      course = await setCourseInactivate(course);
      if (!course.status && status == 1) return;
      coursesInfoJSON.teacher_name = teacher.teacher_name;
      coursesInfoJSON.isTeacherTitular =
        coursesInfoJSON.id_teacher == id_teacher ? 1 : 0;
      coursesInfoJSON.start_date = moment(coursesInfoJSON.start_date).format(
        "D-MMM-YYYY"
      );
      coursesInfoJSON.end_date = moment(coursesInfoJSON.end_date).format(
        "D-MMM-YYYY"
      );
      coursesInfoJSON.type = "Graduation Course";
      return coursesInfoJSON;
    })
  );
  gradCoursesTeacherGiven = gradCoursesTeacherGiven.filter(
    (graduation_course) => graduation_course
  );

  console.log([
    ...coursesTeacherGiven,
    ...extraCoursesInfo,
    ...gradCoursesTeacherGiven,
  ]);
  return [
    ...coursesTeacherGiven,
    ...extraCoursesInfo,
    ...gradCoursesTeacherGiven,
  ];
};

module.exports = {
  getRegularCourseInfo,
  getExtraCourseInfo,
  getGraduationCourseInfo,
  getGraduationSectionInfo,
  setCourseInactivate,
  setSectionInactivate,
  getCoursesGiveTeachersOrTeacher,
};
