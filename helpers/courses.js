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
const { findAssistenceDays } = require("./dates");
const Stu_extracou = require("../models/stu_extracou");
const Extracurricularcourse_ass = require("../models/extracurricularcourse_ass");
const Assit = require("../models/assit");
const Stu_info = require("../models/stu_info");
const { printAndSendError } = require("./responsesOfReq");
const Stu_gro = require("../models/stu_gro");
const Stu_gracou = require("../models/stu_gracou");
const Gra_sec_ass = require("../models/gra_sec_ass");

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
                    col("course.cou_tea.teacher.surname_m"),
                    " ",
                    col("course.cou_tea.teacher.surname_f")
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
  await setCourseInactivate(course, "regular");
  course = course.toJSON();
  course.status = course.status === 1 ? "Activo" : "Inactivo";
  course.start_date = moment(course.start_date).format("D-MMM-YYYY");
  course.end_date = moment(course.end_date).format("D-MMM-YYYY");
  let {
    id_course,
    id_group,
    groupss: {
      major: { major_name },
      ...restGroup
    },
    course: { course_name, cou_tea, clave },
    ...restCourse
  } = course;

  return {
    id_course,
    course_name,
    clave,
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
    applyFormatToDate: true,
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
    applyFormatToDate,
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
      {
        model: Time_tables,
        attributes: [
          [fn("date_format", col("start_hour"), "%H:%i"), "start_hour"],
          [fn("date_format", col("finish_hour"), "%H:%i"), "finish_hour"],
        ],
      },
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
            col("surname_m"),
            " ",
            col("surname_f")
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
        [
          literal(
            `(limit_participants - (SELECT COUNT(*) FROM stu_extracou WHERE stu_extracou.id_ext_cou = id_ext_cou))`
          ),
          "spot_left",
        ],
      ],
    },
  });
  extraCourses = await Promise.all(
    extraCourses.map(async (extraCourse) => {
      extraCourse = await setCourseInactivate(extraCourse, "extracurricular");
      extraCourse = extraCourse.toJSON();
      extraCourse.status = extraCourse.status === 1 ? "Activo" : "Inactivo";
      extraCourse.end_date = moment(extraCourse.start_date)
        .clone()
        .day(moment(extraCourse.start_date).clone().day() + 7);
      if (applyFormatToDate) {
        extraCourse.start_date = moment(extraCourse.start_date).format(
          "D-MMM-YYYY"
        );
        extraCourse.end_date = moment(extraCourse.end_date).format(
          "D-MMM-YYYY"
        );
      }
      let {
        teacher,
        major: { major_name },
        ...restExtraCourse
      } = extraCourse;
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
              col("surname_m"),
              " ",
              col("surname_f")
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

const getGraduationCourseInfo = async (
  id_graduation_course,
  opts = { applyFormatToDate: true }
) => {
  const { applyFormatToDate } = opts;
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
    attributes: [["course_grad_name", "course_name"]],
    where: { id_graduation_course },
  });
  graduationCourse = await setCourseInactivate(graduationCourse, "graduation");
  graduationCourse = graduationCourse.toJSON();
  graduationCourse.status =
    graduationCourse.status === 1 ? "Activo" : "Inactivo";
  if (applyFormatToDate) {
    graduationCourse.start_date = moment(graduationCourse.start_date).format(
      "D-MMM-YYYY"
    );
    graduationCourse.end_date = moment(graduationCourse.end_date).format(
      "D-MMM-YYYY"
    );
  }
  // let {id_teacher,id_graduation_course,graduation_course,teacher,...restGraduationSection} = graduationSection
  // return {...restGraduationSection,...graduation_course,...teacher};
  return graduationCourse;
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
          col("teacher.surname_m"),
          " ",
          col("teacher.surname_f")
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
      courseData.type = "Regular";
      return courseData;
    })
  );
  coursesTeacherGiven = coursesTeacherGiven.filter((course) => course);
  // Extracurricular courses
  let extraCoursesInfo = await getExtraCourseInfo({
    id_teacher,
    courseName,
    teacherName,
    addTeacher: true,
    status: statusCondition.status,
  });
  extraCoursesInfo = extraCoursesInfo.map((extraCourse) => ({
    type: "Extracurricular",
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
                col("graduation_sections.teacher.surname_m"),
                " ",
                col("graduation_sections.teacher.surname_f")
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
      coursesInfoJSON.status =
        coursesInfoJSON.status === 1 ? "Activo" : "Inactivo";
      coursesInfoJSON.teacher_name = teacher.teacher_name;
      coursesInfoJSON.is_teacher_titular =
        coursesInfoJSON.id_teacher == id_teacher;
      coursesInfoJSON.start_date = moment(coursesInfoJSON.start_date).format(
        "D-MMM-YYYY"
      );
      coursesInfoJSON.end_date = moment(coursesInfoJSON.end_date).format(
        "D-MMM-YYYY"
      );
      coursesInfoJSON.type = "Graduation";
      return coursesInfoJSON;
    })
  );
  gradCoursesTeacherGiven = gradCoursesTeacherGiven.filter(
    (graduation_course) => graduation_course
  );

  return [
    ...coursesTeacherGiven,
    ...extraCoursesInfo,
    ...gradCoursesTeacherGiven,
  ];
};

const getExtraCourseInfoForTeacher = async (id_ext_cou = 0) => {
  Extracurricularcourse_ass.belongsTo(Assit, { foreignKey: "id_assistance" });
  Assit.hasOne(Extracurricularcourse_ass, { foreignKey: "id_assistance" });
  let [extraCourseBasicInfo] = await getExtraCourseInfo({
    id_ext_cou,
    addTeacher: false,
    applyFormatToDate: true,
  });
  // Find assistance dates to build the table
  const assistenceDates = findAssistenceDays(
    [moment(extraCourseBasicInfo.start_date).clone().day()],
    moment(extraCourseBasicInfo.start_date).clone(),
    moment(extraCourseBasicInfo.end_date).clone()
  );
  // Find grades and assistences of students signed up to the extra course
  const studentsGradesExtraCou = await Stu_extracou.findAll({
    where: { id_ext_cou },
  });
  const studentsAssitsExtraCou = await Extracurricularcourse_ass.findAll({
    where: { id_ext_cou },
    include: { model: Assit },
  });

  const studentExtraCouDetailed = await Promise.all(
    studentsGradesExtraCou.map(async (studentAssistences) => {
      const studentAssistencesDetails = studentsAssitsExtraCou
        .filter(
          (studentAssitsExtraCou) =>
            studentAssitsExtraCou.id_ext_cou == id_ext_cou &&
            studentAssitsExtraCou.id_student == studentAssistences.id_student
        )
        .map((studentExtraCou) => studentExtraCou.toJSON().assit);
      const { matricula, student_name } = await Stu_info.findOne({
        where: { id_student: studentAssistences.id_student },
        attributes: { exclude: ["id"] },
      });
      return {
        matricula,
        student_name,
        assistences: studentAssistencesDetails,
        ...studentAssistences.toJSON(),
      };
    })
  );
  return (extraCourseBasicInfo = {
    ...extraCourseBasicInfo,
    students: studentExtraCouDetailed,
  });
};

const enrollStudentIntoExtraCou = async (
  id_ext_cou = 0,
  opts = { id_student: "", id_stu_pay: 0 }
) => {
  const { id_student, id_stu_pay } = opts;
  const [extraCourseBasicInfo] = await getExtraCourseInfo({
    id_ext_cou,
    addTeacher: false,
    applyFormatToDate: true,
  });
  await Stu_extracou.create({
    id_student,
    id_ext_cou,
    grade: "-",
    id_stu_pay,
  });
  const assistenceDates = findAssistenceDays(
    [moment(extraCourseBasicInfo.start_date).clone().day()],
    moment(extraCourseBasicInfo.start_date).clone(),
    moment(extraCourseBasicInfo.end_date).clone()
  );
  await Promise.all(
    assistenceDates.map(async (assistenceDate) => {
      const { id_assistance } = await Assit.create({
        date_assistance: assistenceDate,
        attended: 0,
      });
      await Extracurricularcourse_ass.create({
        id_ext_cou,
        id_student,
        id_assistance,
      });
    })
  );
};

const unrollStudentOfExtraCou = async (id_stu_pay = 0) => {
  const [studentExtraCou] = await Stu_extracou.findAll({
    where: { id_stu_pay: id_stu_pay },
  });
  const { id_ext_cou, id_student } = studentExtraCou;
  const studentAssitsExtraCou = await Extracurricularcourse_ass.findAll({
    where: { id_ext_cou, id_student },
  });
  await Promise.all(
    studentAssitsExtraCou.map(async (extraCouAssistence) => {
      const { id_assistance } = extraCouAssistence;
      await extraCouAssistence.destroy();
      await Assit.destroy({ where: { id_assistance } });
    })
  );
  await studentExtraCou.destroy();
};

const assignGradCouToStudentsGroup = async (
  id_group = 0,
  id_graduation_course = 0
) => {
  const studentsFromGroup = await Stu_gro.findAll({
    where: { [Op.and]: [{ id_group }, { status: 1 }] },
  });
  // Sing up students who belong to the group at the moment
  await Promise.all(
    studentsFromGroup.map(async (stu_gro) => {
      const { id_student } = stu_gro;
      Stu_gracou.create({ id_student, id_graduation_course, grade: "-" });
    })
  );
  // Get sections from graduation course
  const graduationCourseSections = await Graduation_section.findAll({
    where: { id_graduation_course },
  });

  // Register assistence to the graduation course
  await Promise.all(
    graduationCourseSections.map(async (graduationSection) => {
      const { start_date, end_date, id_graduation_section } = graduationSection;
      // Get assistence dates of graduation course
      const assistenceDateForSection = findAssistenceDays(
        [],
        start_date,
        end_date,
        { sequential_days: true }
      );
      await Promise.all(
        studentsFromGroup.map(async (stu_gro) => {
          const { id_student } = stu_gro;
          let assitences = await Assit.bulkCreate(
            assistenceDateForSection.map((assistenceDate) => ({
              date_assistance: assistenceDate,
              attended: 0,
            }))
          );
          assitences = assitences
            .map((assist) => assist.toJSON().id_assistance)
            .map((id_assistance) => ({
              id_student,
              id_graduation_section,
              id_assistance,
            }));
          await Gra_sec_ass.bulkCreate(assitences);
        })
      );
    })
  );
  await Group.update({ id_graduation_course }, { where: { id_group } });
};

const unAssingGradCouToStudentsGroup = async (
  id_group = 0,
  id_graduation_course = 0
) => {
  const studentsFromGroup = await Stu_gro.findAll({
    where: { [Op.and]: [{ id_group }, { status: 1 }] },
  });
  // Get sections from graduation course
  const graduationCourseSections = await Graduation_section.findAll({
    where: {
      id_graduation_course,
    },
  });
  // Find assistences of each graduation section and delete them
  await Promise.all(
    graduationCourseSections.map(async (graduationSection) => {
      const { id_graduation_section } = graduationSection;
      const graduationSectionAssistences = await Gra_sec_ass.findAll({
        where: {
          [Op.and]: [
            { id_graduation_section },
            {
              id_student: {
                [Op.in]: [
                  studentsFromGroup.map(
                    (studentGroup) => studentGroup.toJSON().id_student
                  ),
                ],
              },
            },
          ],
        },
      });
      await Promise.all(
        graduationSectionAssistences.map(async (sectionAssistence) => {
          const { id_assistance } = sectionAssistence;
          await sectionAssistence.destroy();
          await Assit.destroy({ where: { id_assistance } });
        })
      );
    })
  );
  // Find student assosiation with graduation course and delete them
  await Stu_gracou.destroy({
    where: {
      [Op.and]: [
        { id_graduation_course },
        {
          id_student: {
            [Op.in]: [
              studentsFromGroup.map(
                (studentGroup) => studentGroup.toJSON().id_student
              ),
            ],
          },
        },
      ],
    },
  });
  await Group.update({ id_graduation_course: null }, { where: { id_group } });
};

const getGraduationCourseInfoForTeacher = async (id_graduation_course = 0) => {
  Gra_sec_ass.belongsTo(Assit, { foreignKey: "id_assistance" });
  Assit.hasOne(Gra_sec_ass, { foreignKey: "id_assistance" });
  const graduationCourseBasicInfo = await getGraduationCourseInfoWithSections(
    id_graduation_course
  );
  const { start_date, end_date } = graduationCourseBasicInfo;
  const assistenceDates = findAssistenceDays([], start_date, end_date, {
    sequential_days: true,
    omitWeekend: true,
  });
  const studentsGraduationCourse = await Stu_gracou.findAll({
    where: { id_graduation_course },
  });
  const studentsGraduationCourseInfo = await Promise.all(
    studentsGraduationCourse.map(async (studentGraduationCourse) => {
      const { id_student } = studentGraduationCourse;
      let studentSectionsAssitences = await Gra_sec_ass.findAll({
        where: {
          [Op.and]: [
            {
              id_graduation_section: {
                [Op.in]: graduationCourseBasicInfo.graduation_sections.map(
                  (section) => section.id_graduation_section
                ),
              },
            },
            {
              id_student,
            },
          ],
        },
        include: { model: Assit },
      });
      studentSectionsAssitences = studentSectionsAssitences.map(
        (sectionAssitence) => sectionAssitence.assit
      );
      const { student_name, matricula } = await Stu_info.findOne({
        where: { id_student },
        attributes: { exclude: ["id"] },
      });
      return {
        ...studentGraduationCourse.toJSON(),
        student_name,
        matricula,
        assitences: studentSectionsAssitences,
      };
    })
  );
  // console.log(studentsGraduationCourseInfo);
  // Gra_sec_ass.findAll({
  //   where: {
  //     [Op.and]: [
  //       {
  //         id_graduation_section: {
  //           [Op.in]: graduationCourseBasicInfo.graduation_sections.map(
  //             (section) => section.id_graduation_section
  //           ),
  //         },
  //       },
  //       {
  //         id_student: {
  //           [Op.in]: studentsGraduationCourse.map(
  //             (studentGraduationCourse) => studentGraduationCourse.id_student
  //           ),
  //         },
  //       },
  //     ],
  //   },
  // });
  // console.log("assistence dates --> ", assistenceDates);
  // console.log(graduationCourseBasicInfo);
  return {
    graduationCourseBasicInfo,
    assistence_dates: assistenceDates,
    students: studentsGraduationCourseInfo,
  };
};

const getGraduationCourseInfoWithSections = async (
  id_graduation_course,
  courseGradName = undefined,
  statusCondition = undefined
) => {
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
  const condition =
    id_graduation_course !== undefined ? { id_graduation_course } : undefined;
  let graduation_courses = await Graduation_courses.findAll({
    where: {
      [courseGradName !== undefined && statusCondition !== undefined
        ? Op.and
        : Op.or]: [
        courseGradName !== undefined
          ? { course_grad_name: { [Op.like]: `%${courseGradName}%` } }
          : undefined,
        statusCondition,
        condition,
      ],
    },
    include: [
      {
        model: Graduation_section,
        attributes: { exclude: ["id_graduation_course"] },
        required: false,
        include: {
          model: Teacher,
          attributes: [
            "id_teacher",
            [
              fn(
                "concat",
                col("graduation_sections.teacher.name"),
                " ",
                col("graduation_sections.teacher.surname_m"),
                " ",
                col("graduation_sections.teacher.surname_f")
              ),
              "teacher_name",
            ],
          ],
        },
      },
      {
        model: Teacher,
        attributes: [
          "id_teacher",
          [
            fn(
              "concat",
              col("teacher.name"),
              " ",
              col("teacher.surname_m"),
              " ",
              col("teacher.surname_f")
            ),
            "teacher_name",
          ],
        ],
      },
    ],
  });
  graduation_courses = await Promise.all(
    graduation_courses.map(async (course) => {
      let { teacher, ...coursesInfoJSON } = course.toJSON();
      coursesInfoJSON.graduation_sections = await Promise.all(
        course.graduation_sections.map(async (section) => {
          section = await setSectionInactivate(section);
          const { teacher, ...sectionInfo } = section.toJSON();
          return { ...sectionInfo, ...teacher };
        })
      );
      coursesInfoJSON.graduation_sections =
        coursesInfoJSON.graduation_sections.filter((section) => section);
      course = await setCourseInactivate(course);
      if (!course.status && statusCondition?.status == 1) return;
      coursesInfoJSON.teacher_name = teacher.teacher_name;
      console.log(coursesInfoJSON.id_graduation_course, coursesInfoJSON.status);
      console.log(coursesInfoJSON.status === 1 ? "Activo" : "Inactivo");
      coursesInfoJSON.status =
        coursesInfoJSON.status === 1 ? "Activo" : "Inactivo";
      return coursesInfoJSON;
    })
  );
  graduation_courses = graduation_courses.filter(
    (graduation_course) => graduation_course
  );
  return id_graduation_course ? graduation_courses[0] : graduation_courses;
};
module.exports = {
  getRegularCourseInfo,
  getExtraCourseInfo,
  getGraduationCourseInfo,
  getGraduationSectionInfo,
  setCourseInactivate,
  setSectionInactivate,
  getCoursesGiveTeachersOrTeacher,
  getExtraCourseInfoForTeacher,
  enrollStudentIntoExtraCou,
  unrollStudentOfExtraCou,
  assignGradCouToStudentsGroup,
  unAssingGradCouToStudentsGroup,
  getGraduationCourseInfoForTeacher,
  getGraduationCourseInfoWithSections,
};
