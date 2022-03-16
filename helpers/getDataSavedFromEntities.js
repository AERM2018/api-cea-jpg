const { Op, fn, col } = require("sequelize");
const Campus = require("../models/campus");
const Cam_use = require("../models/cam_use");
const Course = require("../models/courses");
const Department = require("../models/department");
const Educational_level = require("../models/educational_level");
const Employees = require("../models/employee");
const Emp_dep = require("../models/emp_dep");
const Emp_tim = require("../models/emp_tim");
const Graduation_courses = require("../models/graduation_courses");
const Graduation_section = require("../models/graduation_section");
const Gro_cou = require("../models/gro_cou");
const Gro_tim = require("../models/gro_tim");
const Major = require("../models/major");
const Restriction = require("../models/restriction");
const Scholarship = require("../models/scholarship");
const Sch_stu = require("../models/sch_stu");
const Student = require("../models/student");
const Teacher = require("../models/teacher");
const Time_tables = require("../models/time_tables");
const User = require("../models/user");
const {
  setCourseInactivate,
  getExtraCourseInfo,
  setSectionInactivate,
} = require("./courses");
const { getGroupInfo } = require("./groups");

const getCampusInfo = async (id_campus) => {
  const condition = id_campus !== undefined ? { id_campus } : undefined;
  const campus = await Campus.findAll({ where: condition });
  return id_campus ? campus[0] : campus;
};

const getMajorsInfo = async (id_major) => {
  const condition = id_major !== undefined ? { id_major } : undefined;
  Educational_level.hasOne(Major, { foreignKey: "id_edu_lev" });
  Major.belongsTo(Educational_level, { foreignKey: "id_edu_lev" });
  let majors = await Major.findAll({
    include: {
      model: Educational_level,
      attributes: ["educational_level"],
    },
    attributes: {
      include: [
        [
          fn("concat", col("educational_level"), " en ", col("major_name")),
          "major_name",
        ],
      ],
    },
    where: condition,
  });
  majors = majors.map((major) => {
    const { educational_level, ...restMajor } = major.toJSON();
    return {
      ...restMajor,
      ...educational_level,
    };
  });
  return id_major ? majors[0] : majors;
};

const getGroupsInfoWithTimeTable = async (id_group) => {
  groups = await getGroupInfo(id_group);
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
  return id_group ? groups[0] : groups;
};

const getTeachersInfoWithTimeTable = async (id_teacher) => {
  const condition = id_teacher !== undefined ? { id_teacher } : undefined;
  Teacher.belongsTo(User, { foreignKey: "id_user" });
  User.hasOne(Teacher, { foreignKey: "id_user" });
  Cam_use.belongsTo(User, { foreignKey: "id_user" });
  User.hasOne(Cam_use, { foreignKey: "id_user" });
  Cam_use.belongsTo(Campus, { foreignKey: "id_campus" });
  Campus.hasOne(Cam_use, { foreignKey: "id_campus" });
  let teachers = await Teacher.findAll({
    include: {
      model: User,
      include: {
        model: Cam_use,
        include: {
          model: Campus,
          attributes: ["id_campus", "campus_name"],
        },
      },
    },
    attributes: {
      include: [
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
    where: { ...condition },
    raw: true,
    nest: true,
  });
  teachers = teachers.map((teacher) => {
    const {
      user: {
        cam_use: { campus },
        email,
      },
      active,
      ...restTeacher
    } = teacher;
    return {
      active: active === 1 ? "Activo" : "Inactivo",
      ...restTeacher,
      email,
      ...campus,
    };
  });
  return id_teacher ? teachers[0] : teachers;
};

const getEmployeesInfoWithTimeTable = async (id_employee) => {
  const condition = id_employee !== undefined ? { id_employee } : undefined;
  Employees.belongsTo(User, { foreignKey: "id_user" });
  User.hasOne(Employees, { foreignKey: "id_employee" });
  Cam_use.belongsTo(User, { foreignKey: "id_user" });
  User.hasOne(Cam_use, { foreignKey: "id_user" });
  Cam_use.belongsTo(Campus, { foreignKey: "id_campus" });
  Campus.hasOne(Cam_use, { foreignKey: "id_campus" });
  Emp_dep.belongsTo(Employees, { foreignKey: "id_employee" });
  Employees.hasOne(Emp_dep, { foreignKey: "id_employee" });
  Emp_dep.belongsTo(Department, { foreignKey: "id_department" });
  Department.hasOne(Emp_dep, { foreignKey: "id_department" });
  let employees_no_time = await Employees.findAll({
    where: condition,
    include: [
      {
        model: User,
        include: {
          model: Cam_use,
          include: { model: Campus },
        },
      },
      {
        model: Emp_dep,
        include: { model: Department },
      },
    ],
    attributes: {
      include: [
        [
          fn(
            "concat",
            col("name"),
            " ",
            col("surname_f"),
            " ",
            col("surname_m")
          ),
          "employee_name",
        ],
      ],
    },
  });
  employees_no_time = employees_no_time.map((employee) => {
    const {
      user: {
        id_user,
        email,
        cam_use: {
          campus: { id_campus, campus_name },
        },
      },
      emp_dep: {
        department: { id_department, department_name },
      },
      ...restEmployee
    } = employee.toJSON();
    return {
      ...restEmployee,
      id_user,
      email,
      id_campus,
      campus_name,
      id_department,
      department_name,
    };
  });
  const employees_time = await Promise.all(
    employees_no_time.map(async (employee) => {
      const emp_time = await Emp_tim.findAll({
        where: { id_employee: employee.id_employee },
        attributes: ["id_time_table"],
      });

      const time_table = await Time_tables.findAll({
        where: {
          id_time_table: {
            [Op.in]: emp_time.map(
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
        ...employee,
        time_table: time_table.map((time_table) => time_table.toJSON()),
      };
    })
  );
  return id_employee ? employees_time[0] : employees_time;
};

const getCoursesInfoWithRestrinctions = async (id_course, course_name) => {
  const condition = id_course !== undefined ? { id_course } : undefined;
  Course.belongsTo(Major, { foreignKey: "id_major" });
  Major.hasMany(Course, { foreignKey: "id_major" });

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
          ...(course_name
            ? { course_name: { [Op.like]: `%${course_name}%` } }
            : undefined),
          ...condition,
        },
      ],
    },
  });

  courses = await Promise.all(
    courses.map(async (course) => {
      const { major, ...restoCourse } = course.toJSON();
      let restricted_by_course = "";
      let restricted_by_extracourse = "";
      const restriction = await Restriction.findOne({
        where: { restricted_course: restoCourse.id_course },
      });
      if (restriction) {
        restricted_by_course = restriction.toJSON().mandatory_course;
        restricted_by_extracourse = restriction.toJSON().mandatory_extracourse;
        console.log("a", restricted_by_course);
        console.log("b", restricted_by_extracourse);
      }
      return {
        ...restoCourse,
        restricted_by_course:
          restricted_by_course === null ? "" : restricted_by_course,
        restricted_by_extracourse:
          restricted_by_extracourse === null ? "" : restricted_by_extracourse,
        major_name: major.major_name,
      };
    })
  );
  return id_course ? courses[0] : courses;
};

const getExtraCoursesWithTimeTable = async (
  id_ext_cou,
  addTeacher,
  teacherName,
  status,
  applyFormatToDate
) => {
  let extracurricular_courses = await getExtraCourseInfo({
    id_ext_cou,
    addTeacher,
    teacherName,
    status,
    applyFormatToDate,
  });
  extracurricular_courses = extracurricular_courses.map((extraCourse) => {
    const { time_table, ...restExtraCourse } = extraCourse;
    return {
      ...restExtraCourse,
      ...time_table,
    };
  });
  return id_ext_cou ? extracurricular_courses[0] : extracurricular_courses;
};

const getGraduationCourseInfoWithSections = async (
  id_graduation_course,
  courseGradName,
  statusCondition
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
                col("graduation_sections.teacher.surname_f"),
                " ",
                col("graduation_sections.teacher.surname_m")
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
              col("teacher.surname_f"),
              " ",
              col("teacher.surname_m")
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

const getSchoolarshipsInfo = async (id_scholarship) => {
  const condition =
    id_scholarship !== undefined ? { id_scholarship } : undefined;
  Sch_stu.belongsTo(Scholarship, { foreignKey: "id_scholarship" });
  Scholarship.hasOne(Sch_stu, { foreignKey: "id_scholarship" });
  Sch_stu.belongsTo(Student, { foreignKey: "id_student" });
  Student.hasOne(Sch_stu, { foreignKey: "id_student" });

  let scholarships = await Scholarship.findAll({
    where: condition,
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
  return id_scholarship ? scholarships[0] : scholarships;
};
module.exports = {
  getEmployeesInfoWithTimeTable,
  getSchoolarshipsInfo,
  getCampusInfo,
  getTeachersInfoWithTimeTable,
  getGroupsInfoWithTimeTable,
  getCoursesInfoWithRestrinctions,
  getMajorsInfo,
  getExtraCoursesWithTimeTable,
  getGraduationCourseInfoWithSections,
};
// employees, courses
