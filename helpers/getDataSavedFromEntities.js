const { Op, fn, col } = require("sequelize");
const moment = require("moment");
const Campus = require("../models/campus");
const Cam_use = require("../models/cam_use");
const Course = require("../models/courses");
const Department = require("../models/department");
const Educational_level = require("../models/educational_level");
const Employees = require("../models/employee");
const Emp_dep = require("../models/emp_dep");
const Emp_exp = require("../models/emp_exp");
const Emp_tim = require("../models/emp_tim");
const Expense = require("../models/expense");
const Expenses_types = require("../models/expenses_type");
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
const { expenses_type } = require("../types/dictionaries");
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
      attributes: ["educational_level"],
      model: Educational_level,
      attributes: {
        include: [
          [
            fn("concat", col("educational_level"), " en ", col("major_name")),
            "major_name",
          ],
        ],
      },
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
            col("surname_m"),
            " ",
            col("surname_f")
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
  Educational_level.hasOne(Major, { foreignKey: "id_edu_lev" });
  Major.belongsTo(Educational_level, { foreignKey: "id_edu_lev" });
  let gro_cou = await Gro_cou.findAll();
  await Promise.all(
    gro_cou.map(async (gro_cou) => {
      gro_cou = await setCourseInactivate(gro_cou);
      return gro_cou.status;
    })
  );
  let courses = await Course.findAll({
    include: {
      model: Major,
      include: {
        model: Educational_level,
        attributes: {
          include: [
            [
              fn("concat", col("educational_level"), " en ", col("major_name")),
              "major_name",
            ],
          ],
        },
      },
    },
    where: {
      [Op.or]: [
        course_name !== undefined
          ? { course_name: { [Op.like]: `%${course_name}%` } }
          : undefined,
        condition,
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
      }
      return {
        ...restoCourse,
        restricted_by_course:
          restricted_by_course === null ? "" : restricted_by_course,
        restricted_by_extracourse:
          restricted_by_extracourse === null ? "" : restricted_by_extracourse,
        major_name: major.educational_level.major_name,
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
              col("surname_m"),
              " ",
              col("surname_f"),
              " ",
              col("name")
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

const getExpensesInfo = async (id_expense, date) => {
  const condition = id_expense !== undefined ? { id_expense } : true;
  const dateCondition = date === "all" || !date ? true : { date };

  Expenses_types.belongsTo(Expense, { foreignKey: "id_expense" });
  Expense.hasOne(Expenses_types, { foreignKey: "id_expense" });

  Emp_exp.belongsTo(Expense, { foreignKey: "id_expense" });
  Expense.hasOne(Emp_exp, { foreignKey: "id_expense" });

  Emp_exp.belongsTo(Employees, { foreignKey: "id_employee" });
  Employees.hasMany(Emp_exp, { foreignKey: "id_employee" });

  let expenses = await Expense.findAll({
    include: [
      {
        model: Expenses_types,
        attributes: ["expense_type", "observation"],
      },
      {
        model: Emp_exp,
        include: {
          model: Employees,
          attributes: ["id_employee"],
        },
      },
    ],
    where: { [Op.and]: [condition, dateCondition] },
  });

  if (!expenses) {
    return res.status(400).json({
      ok: false,
      msg: "No existen gastos de la fecha " + fecha,
    });
  }

  expenses = expenses.map((expense) => {
    const {
      expenses_type: expense_type,
      emp_exp,
      date,
      ...restoExpense
    } = expense.toJSON();
    const [d, m, y] = moment(date).format(`D MMMM YYYY`).split(" ");
    return {
      ...restoExpense,
      date: `${d} de ${m} de ${y}`,
      expenses_type: expenses_type[expense_type.expense_type],
      observation: expense_type.observation,
      id_employee: emp_exp.employee.id_employee,
    };
  });
  return id_expense !== undefined ? expenses[0] : expenses;
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
  getExpensesInfo,
};
// employees, courses
