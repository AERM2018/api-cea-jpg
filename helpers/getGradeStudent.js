const { QueryTypes,fn, col } = require("sequelize");

const Course = require("../models/courses");
const Grades = require("../models/grades");
const moment = require('moment');
const Cou_tea = require("../models/cou_tea");
const Teacher = require("../models/teacher");
const Gro_cou = require("../models/gro_cou");
const Stu_pay = require("../models/stu_pay");
const Payment = require("../models/payment");
const Stu_extracou = require("../models/stu_extracou");
const Student = require("../models/student");
const ExtraCurricularCourses = require("../models/extracurricularcourses");
const Stu_gracou = require("../models/stu_gracou");
const Tesine = require("../models/tesine");
const Graduation_courses = require("../models/graduation_courses");

const getGradesStudent = async (id_student = "", getAvg = false) => {
  let avgStudent = 0;
  let gradesStudentPaidCourses = []
  Course.hasOne(Grades, { foreignKey: "id_course" });
  Grades.belongsTo(Course, { foreignKey: "id_course" });

  const gradesStudent = await Grades.findAll({
    where: { id_student },
    include : { model: Course},
    attributes: ["id_course", "grade", "id_grade"],
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
            date,
            type : 'regular'
        }
  })

 const gradesWithTeacher = await Promise.all(gradesStudentPaidCourses) 

  return gradesWithTeacher
};


const getExtraCoursesGradesStudent = async( id_student = '') => {
  Stu_extracou.belongsTo(Student, {foreignKey : 'id_student'})
  Student.hasMany(Stu_extracou, {foreignKey : 'id_student'})

  Stu_extracou.belongsTo(ExtraCurricularCourses, {foreignKey : 'id_ext_cou'})
  ExtraCurricularCourses.hasMany(Stu_extracou, {foreignKey : 'id_ext_cou'})

  ExtraCurricularCourses.belongsTo(Teacher, {foreignKey : 'id_teacher'})
  Teacher.hasMany(ExtraCurricularCourses, {foreignKey : 'id_teacher'})
  
  let extraCoursesGradesStudent = await Stu_extracou.findAll({
    include : [{
      model : ExtraCurricularCourses,
      attributes : ['ext_cou_name'],
      include : {
        model : Teacher,
        attributes : [[fn('concat',col('extracurricular_course->teacher.name')," ",col('extracurricular_course->teacher.surname_f')," ",col('extracurricular_course->teacher.surname_m')),'teacher_name']]
      }
    }],
    attributes : { exclude : ['id_student','id_stu_extracou']},
    where : {id_student}
})

extraCoursesGradesStudent = extraCoursesGradesStudent.map( extraCourseGrade => {
  const {extracurricular_course,...restoExtraCourseGrade} = extraCourseGrade.toJSON()
  const date = moment(extracurricular_course.end_date).format('MMMM,YYYY')
    return {
      ...restoExtraCourseGrade,
      ext_cou_name : extracurricular_course.ext_cou_name,
      ...extracurricular_course.teacher,
    date,
    type : 'extra'
  }
});

return extraCoursesGradesStudent
}

const getTesineGradeStudent = async( id_student = '') => {
  Stu_gracou.belongsTo(Tesine, { foreignKey : 'id_tesine'})
  Tesine.hasOne(Stu_gracou, { foreignKey : 'id_tesine'})

  Stu_gracou.belongsTo(Graduation_courses, { foreignKey : 'id_graduation_course'})
  Graduation_courses.hasMany(Stu_gracou, { foreignKey : 'id_graduation_course'})

  Tesine.belongsTo(Teacher, { foreignKey : 'id_teacher'})
  Teacher.hasMany(Tesine, { foreignKey : 'id_teacher'})
  let tesineGradeStudent = await Stu_gracou.findOne({
    include : [{
      model : Graduation_courses,
      attributes : ['course_grad_name']
    },{
      model : Tesine,
      include : {
        model : Teacher,
        attributes : [[fn('concat',col('name')," ",col('surname_f')," ",col('surname_m')),'teacher_name']]
      },
      attributes : {exclude : ['id_teacher']}
    }],
    where : { id_student }
  })

 if(tesineGradeStudent){
  const {graduation_course, tesine, ...restoTesineGrade} = tesineGradeStudent.toJSON()
  const { teacher, ...restoTesine} = tesine
  // const dateDelivery = moment(restoTesine.delivery_date).format('MMMM,YYYY')
  // const dateAccepted = moment(restoTesine.accepted_date).format('MMMM,YYYY')

  tesineGradeStudent = {
    ...restoTesine,
    ...teacher,
    ...graduation_course,
    // delivery_date : dateDelivery,
    // accepted_date : dateAccepted,

  }
  return tesineGradeStudent
 }
 return {}
}

module.exports = {
  getGradesStudent,
  getExtraCoursesGradesStudent,
  getTesineGradeStudent
};
