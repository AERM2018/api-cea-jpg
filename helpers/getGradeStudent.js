const { QueryTypes } = require("sequelize");
const { db } = require("../database/connection");
const Course = require("../models/courses");
const Grades = require("../models/grades");
const moment = require('moment');
const getGradesStudent = async (id_student = "", getAvg = false) => {
  let avgStudent = 0;
  Course.hasOne(Grades, { foreignKey: "id_course" });
  Grades.belongsTo(Course, { foreignKey: "id_course" });
  let gradesStudent = await Grades.findAll({
    where: { id_student },
    include : { model: Course},
    attributes: ["id_course", "grade"],
  });

  if (getAvg) {
    gradesStudent.forEach((grade) => {
      avgStudent += grade.toJSON().grade;
    });

    avgStudent /= gradesStudent.length;

    return avgStudent;
  }

  gradesStudent = gradesStudent.map( async(gradeStudent) => {
        const {course} = gradeStudent.toJSON()
        const {course_name} = course
        let [teacherCourse] = await db.query("SELECT CONCAT(tea.name,' ',tea.surname_f,' ',tea.surname_m) as 'name', end_date as 'date' FROM cou_tea  LEFT JOIN teachers tea ON tea.id_teacher = cou_tea.id_teacher WHERE id_course = :id_course",{ replacements : {id_course:course.id_course},type: QueryTypes.SELECT})


        teacherCourse.date = moment(teacherCourse.date).format('MMMM,YYYY')
        return {
            ...gradeStudent.toJSON(),
            course : course_name,
            teacher : teacherCourse.name,
            date: teacherCourse.date
        }
  })

 const gradesWithTeacher = await Promise.all(gradesStudent) 

  return gradesWithTeacher
};

module.exports = {
  getGradesStudent,
};
