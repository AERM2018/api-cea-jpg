const { Op, col, fn, QueryTypes } = require("sequelize")
const { document_types, fee_school, getFeeCourseByMajor, getFeeSchoolByMajor } = require('../types/dictionaries')
const Course = require("../models/courses")
const Gro_cou = require("../models/gro_cou")
const { db } = require("../database/connection");
const { getReqPay } = require('../queries/queries');
const Pay_info = require("../models/pay_info");
const { getGroupDaysAndOverdue } = require("./dates");
const Payment = require("../models/payment");
const Partial_pay = require("../models/partial_pay");
const Grades = require("../models/grades");
const moment = require('moment');
const Cou_tea = require("../models/cou_tea");
const Teacher = require("../models/teacher");
const Stu_pay = require("../models/stu_pay");
const Stu_extracou = require("../models/stu_extracou");
const Student = require("../models/student");
const ExtraCurricularCourses = require("../models/extracurricularcourses");
const Stu_gracou = require("../models/stu_gracou");
const Tesine = require("../models/tesine");
const Graduation_courses = require("../models/graduation_courses");
const Stu_info = require("../models/stu_info");
const Test = require("../models/test");
const { raw } = require("mysql");

const getStudentInfo = async (matricula = '') => {
    return await Stu_info.findOne({
        where:{matricula},
        attributes : {
            exclude:['id','name','surname_f','surname_m',],
            include : [
                [fn('concat',col('name'),' ',col('surname_f'),' ',col('surname_m')),'student_name'],
                [fn('concat',col('educational_level'),' en ',col('major_name')),'major_name']
            ]
        },
        raw : true
    })
}

const getPaymentStudent = async (id_student = '', details = false, status_payment = {}, edu_level = "") => {

    let missing = 0;

    const allPaymentsByStudent = await Pay_info.findAll({
        where: { id_student, ...status_payment },
        order: [['payment_date', 'desc']],
        attributes: { exclude: ['id'] }
    })

    let extra;

    const moneyFromPayments = allPaymentsByStudent.map(async (pay_info) => {
        let expected
        const { payment_type, id_payment, id_group, major_name, payment_date, start_date,current, educational_level } = pay_info
        let { amount, status_payment, cutoff_date } = pay_info
        expected = amount
        const partial_pays_payment = await Partial_pay.findAll({
            where : {
                id_payment
            }
        })
        const last_payment_date = partial_pays_payment[partial_pays_payment.length - 1].toJSON()['date_p']
        switch (payment_type) {
            case 'Documento':
                let req_pay = await db.query(getReqPay, { replacements: { id: id_payment }, type: QueryTypes.SELECT })
                if (details) {
                    // Find the name of the document that is related with the payment
                    const doc_type = req_pay[0].name 
                    req_pay[0].name = document_types[doc_type]['name']
                    const { name } = req_pay[0]
                    extra = { name }
                }
                break;
            case 'Materia':
                const { first_day, last_day, overdue } = await getGroupDaysAndOverdue(id_group, start_date)
                const amount_origin = getFeeCourseByMajor(educational_level)
                // Change the payment's amount in case it's necessary
                if(status_payment != 1 ){
                    // Change the status if the date is overdue
                    if((status_payment === 0 && moment().month() >= moment(cutoff_date).month() && moment().year() >= moment(cutoff_date).year())){
                        if(moment().month() > moment(cutoff_date).month()){
                            if(moment().diff(moment(start_date).endOf('month'),"days") >= 15){
                                status_payment = 2
                            }
                            await Payment.update({ cutoff_date : moment(cutoff_date).endOf('month').add(15,"days") }, {
                                    where: { id_payment }
                                })
                        }else if(moment(start_date).month() != moment(cutoff_date).month() && moment().month() === moment(cutoff_date).month() && moment().diff(moment(start_date).endOf('month'),"days") >= 15){
                            status_payment = 2
                            
                        }

                        if(status_payment === 2){
                            await Payment.update({ status_payment : 2 }, {
                                        where: { id_payment }
                                    })
                        }else{
                            // Changing the cutoff date if it is within the start_date's month
                            if(moment().local().day(moment(first_day).day() + 7).isSameOrBefore(moment(start_date).endOf('month'))) {
                                await Payment.update({ cutoff_date : moment().local().day(moment(first_day).day() + 7).format().substr(0, 10)}, {
                                    where: { id_payment }
                                })
                            }
                           
                        }
                    }
                    if((status_payment === 0 && moment().month() === moment(cutoff_date).month()) || (status_payment === 2 && moment().month() != moment(cutoff_date).month())){
                        if (amount_origin + overdue != amount) {
                            await Payment.update({ amount: amount_origin + overdue }, {
                                where: { id_payment }
                            })
                            expected = amount_origin + overdue
                        }
                    }
                }else {
                    expected = amount
                }
                // Get the course's name which the student's taking now
                Gro_cou.belongsTo(Course, { foreignKey: 'id_course' })
                Course.hasMany(Gro_cou, { foreignKey: 'id_course' })
                const gro_cou = await Gro_cou.findOne({
                    where: {
                        [Op.and]: {
                            start_date: { [Op.gte]: start_date },
                            end_date: { [Op.lte]: moment(start_date).endOf('month').format().substr(0,10) },
                            id_group
                        }
                    },
                    include: {
                        model: Course,
                        attributes: [[col('id_course'), 'id'], [col('course_name'), 'name']]
                    },
                    attributes: { exclude: ['id_gro_cou', 'id_course', 'id_group', 'start_date', 'end_date', 'status'] }

                })

                let course
                if (!gro_cou) {
                    course = { name: `Pago adelantado de materia del mes ${moment(start_date).format('MMMM-YYYY')}` }
                } else {
                    course = { ...gro_cou.toJSON()['course'] }
                }

                extra = { ...course }
                break;

            case 'Inscripción':
                extra = { name: `Inscripción a ${edu_level} en ${major_name}` }
                break;
        }

        extra = { ...extra, id_payment, status_payment, payment_date,last_payment_date, payment_type }
        return (details) ? { expected, current, missing: (expected - current), ...extra } : { expected, current }
    })

    const payments = await Promise.all(moneyFromPayments)
    

    // Get the total money of the payments
    let money_exp = 0, money = 0
    payments.forEach(pay => {
        money_exp += pay.expected
        money += pay.current
    })
    if (!details) {
        return { money_exp, money }
    }

    return { money_exp, money, missing: (money_exp - money), payments }

}

const getGradesStudent = async (id_student = "", opts = { onlyAvg : false ,withAvg : false, forKardex : false}) => {
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
    //   FIXME: SE TIENE QUE RETORNAR NULL?
    //   if(!paymentCourse &&  moment().diff(moment(start_date).endOf('month').add('15','days'),'days') >= 0){
    //     return null;
    //   }
  
      // if(!paymentCourse && moment().diff(moment(start_date).endOf('month').add('15','days')) >= 0){
        // console.log('se destruyó')
        // await grade.destroy()
        // return {}
      // }
      return grade
    })
  
    if (opts.onlyAvg || opts.withAvg) {
      gradesStudent.forEach((grade) => {
        avgStudent += grade.toJSON().grade;
      });
  
      avgStudent /= gradesStudent.length;
      avgStudent = avgStudent.toFixed(1)
  
      if (opts.onlyAvg ) return avgStudent;
    }
    gradesStudentPaidCourses = await Promise.all(gradesStudentPaidCourses)
    gradesStudentPaidCourses = gradesStudentPaidCourses.filter( gradeStudent => gradeStudent !== null);
    gradesStudentPaidCourses = gradesStudentPaidCourses.map( async(gradeStudent) => {
          const {course, id_grade} = gradeStudent.toJSON()
          const {id_course,course_name,clave,credits} = course
          let testInfo;
  
          Cou_tea.belongsTo(Teacher, {foreignKey: 'id_teacher'})
          Teacher.hasMany(Cou_tea, {foreignKey : 'id_teacher'})
          let courseTeacher = await Cou_tea.findOne({
              where : {id_course},
              include : {model : Teacher, attributes: [
                  [fn('concat',col('name')," ",col('surname_f')," ",col('surname_m')),'name'],
              ]}
          })
          
          const date = moment(courseTeacher.toJSON().end_date).format('MMMM,YYYY')
          if(opts.forKardex){
                testInfo = await Test.findAll({
                    attributes:['application_date',['type','test_type']],
                    where : {id_grade,applied:true},
                    order : [['application_date','DESC']],
                    limit:1,
                    raw:true
                })
          }
          return {
              ...gradeStudent.toJSON(),
              course : course_name,
              key : clave,
              credits,
              ...(testInfo)?testInfo[0]:{},
              teacher : courseTeacher.toJSON().teacher.name,
              date,
              type : 'regular'
          }
    })
  
    let gradesWithTeacher = await Promise.all(gradesStudentPaidCourses)
  
    return {grades:gradesWithTeacher , generalAvg : (opts.withAvg) ? avgStudent : undefined}
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
   return null
}


const filterGradesStudent = ( gradesStudent = [], q = '') => {

    return gradesStudent.filter( gradeStudent => {
        const {student_name, matricula, group_name } = gradeStudent
        if(student_name.toLowerCase().split(' ').join('').includes(q)){
            gradeStudent.q = 'student_name'
            return gradeStudent
        }
        if ((matricula.toLowerCase().includes(q))){
            gradeStudent.q = 'matricula'
            return gradeStudent
        }

        if ((group_name.toLowerCase().split(' ').join('').includes(q))){
            gradeStudent.q = 'group_name'
            return gradeStudent
        }
    })

}

const getCourseStudentIsTaking = async( id_group = 0) => {
    Course.hasOne(Gro_cou, { foreignKey: 'id_course' })
    Gro_cou.belongsTo(Course, { foreignKey: 'id_course' })

    const {first_day,last_day} = await getGroupDaysAndOverdue( id_group )
    const gro_cou = await Gro_cou.findOne({
        include: {
            model: Course,
            attributes: ['course_name'],
        },
        where: {
            id_group,
            start_date :{ [Op.gte] : moment(first_day).startOf('month').format().substr(0,10)},
            end_date: { [Op.lte]: moment(last_day).endOf('month').format().substr(0,10) },
        }

    })

    if(gro_cou){
        course = {course_name: gro_cou.toJSON().course.course_name}
        const {id_course} = gro_cou
        Cou_tea.belongsTo(Teacher, {foreignKey: 'id_teacher'})
        Teacher.hasMany(Cou_tea, {foreignKey : 'id_teacher'})
        let courseTeacher = await Cou_tea.findOne({
            where : {id_course},
            include : {model : Teacher, attributes: [
                [fn('concat',col('name')," ",col('surname_f')," ",col('surname_m')),'name'],
            ]}
        })
        course = {...course, teacher : courseTeacher.toJSON().teacher.name}
    }else{
        course = {course_name:'Materia no asignada'}
    }

    return course
}
module.exports = {
    getPaymentStudent,
    getGradesStudent,
    getExtraCoursesGradesStudent,
    getTesineGradeStudent,
    filterGradesStudent,
    getCourseStudentIsTaking,
    getStudentInfo
};
