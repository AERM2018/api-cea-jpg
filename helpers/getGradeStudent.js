const { QueryTypes,fn, col } = require("sequelize");

const Course = require("../models/courses");
const Grades = require("../models/grades");
const moment = require('moment');
const Cou_tea = require("../models/cou_tea");
const Teacher = require("../models/teacher");
const Gro_cou = require("../models/gro_cou");
const Stu_pay = require("../models/stu_pay");
const Payment = require("../models/payment");
const getGradesStudent = async (id_student = "", getAvg = false) => {
  let avgStudent = 0;
  let gradesStudentPaidCourses = []
  Course.hasOne(Grades, { foreignKey: "id_course" });
  Grades.belongsTo(Course, { foreignKey: "id_course" });

  const gradesStudent = await Grades.findAll({
    where: { id_student },
    include : { model: Course},
    attributes: ["id_course", "grade"],
  });

  gradesStudentPaidCourses = gradesStudent.map( async( grade ) => {
    const {start_date} = await Gro_cou.findOne({
      where : {id_course : grade.id_course},
      attributes : ['start_date']
    })

    Stu_pay.belongsTo(Payment, { foreignKey : 'id_payment'})
    Payment.hasMany(Stu_pay, { foreignKey : 'id_payment'})
    const paymentCourse = await Stu_pay.findOne({ 
      include : { 
        model : Payment, 
        attributes : ['start_date','status_payment','payment_type'],
        where : {
          start_date : moment(start_date).format('YYYY-MMM-DD'),
          status_payment : 1,
          payment_type : 'Materia'}},
      where: {id_student}
    })
    if(!paymentCourse &&  moment().diff(moment(start_date).endOf('month').add('15','days'),'days') >= 0){
      return null;
    }

    // if(!paymentCourse && moment().diff(moment(start_date).endOf('month').add('15','days')) >= 0){
      // console.log('se destruyó')
      // await grade.destroy()
      // return {}
    // }
    return grade
  })

  if (getAvg) {
    gradesStudent.forEach((grade) => {
      avgStudent += grade.toJSON().grade;
    });

    avgStudent /= gradesStudent.length;

    return avgStudent;
  }
  gradesStudentPaidCourses = await Promise.all(gradesStudentPaidCourses)
  gradesStudentPaidCourses = gradesStudentPaidCourses.filter( gradeStudent => gradeStudent !== null);
  gradesStudentPaidCourses = gradesStudentPaidCourses.map( async(gradeStudent) => {
        const {course} = gradeStudent.toJSON()
        const {id_course,course_name} = course

        Cou_tea.belongsTo(Teacher, {foreignKey: 'id_teacher'})
        Teacher.hasMany(Cou_tea, {foreignKey : 'id_teacher'})
        let courseTeacher = await Cou_tea.findOne({
            where : {id_course},
            include : {model : Teacher, attributes: [
                [fn('concat',col('name')," ",col('surname_f')," ",col('surname_m')),'name'],
            ]}
        })
        
        const date = moment(courseTeacher.toJSON().end_date).format('MMMM,YYYY')
        return {
            ...gradeStudent.toJSON(),
            course : course_name,
            teacher : courseTeacher.toJSON().teacher.name,
            date
        }
  })

 const gradesWithTeacher = await Promise.all(gradesStudentPaidCourses) 

  return gradesWithTeacher
};

module.exports = {
  getGradesStudent,
};
