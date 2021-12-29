const { fn, col } = require("sequelize");
const moment = require('moment');
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

const getRegularCourseInfo = async(opts={id_gro_cou:0,addTeacher : false}) => {
  const {id_gro_cou,addTeacher} = opts
 // Buscar información acerca del curso
    Gro_cou.belongsTo(Group, { foreignKey : 'id_group'})
    Group.hasOne(Gro_cou, { foreignKey : 'id_group'})

    Gro_cou.belongsTo(Course, { foreignKey : 'id_course'})
    Course.hasMany(Gro_cou, { foreignKey : 'id_course'})

    Cou_tea.belongsTo(Course, { foreignKey : 'id_course'})
    Course.hasOne(Cou_tea, { foreignKey : 'id_course'})

    Cou_tea.belongsTo(Teacher, { foreignKey : 'id_teacher'})
    Teacher.hasOne(Cou_tea, { foreignKey : 'id_teacher'})

    Group.belongsTo(Major, { foreignKey : 'id_major'})
    Major.hasOne( Group, { foreignKey : 'id_major'})

    Major.belongsTo(Educational_level, { foreignKey : 'id_edu_lev'})
            Educational_level.hasOne(Major, { foreignKey : 'id_edu_lev'})
    let course = await Gro_cou.findOne({
        include : [{
          model : Group,
          attributes : { include: [['name_group','group_name']], exclude : ['name_group','entry_year','end_year']},
          include : {
              model : Major,
              attributes : [[fn('concat',col('groupss.major->educational_level.educational_level')," en ",col('groupss.major.major_name')),'major_name']],
              include : {model : Educational_level}
          }
        },{
          model : Course,
          ...(addTeacher)&&{include : {
            model : Cou_tea,
            include : {
                model : Teacher,
                attributes : ['id_teacher',[fn('concat',col('course.cou_tea.teacher.name'),' ',col('course.cou_tea.teacher.surname_f'),' ',col('course.cou_tea.teacher.surname_m')),'teacher_name']]
              }
          }}
        }],
        where : {id_gro_cou},
    })
    let setInactivate = await setCourseInactivate(course)
    if(setInactivate) course.status = 0
    let {id_course,id_group,groupss:{major:{major_name},...restGroup},course:{course_name,cou_tea},...restCourse} = course.toJSON()

    return {id_course,course_name,id_group,...restGroup,major_name,...restCourse,...(addTeacher)&&cou_tea.teacher}
}

const getExtraCourseInfo = async(opts={id_ext_cou,addTeacher:false}) => {
    ExtraCurricularCourses.belongsTo(Major,{foreignKey:'id_major'})
    Major.hasOne(ExtraCurricularCourses,{foreignKey:'id_major'})
    ExtraCurricularCourses.belongsTo(Teacher,{foreignKey:'id_teacher'})
    Teacher.hasOne(ExtraCurricularCourses,{foreignKey:'id_teacher'})
    Major.belongsTo(Educational_level,{foreignKey:'id_edu_lev'})
    Educational_level.hasOne(Major,{foreignKey:'id_edu_lev'})

    const {id_ext_cou,addTeacher} = opts
    let includeOpts={include:[{
      model:Major,
      attributes : [[fn('concat',col('major->educational_level.educational_level')," en ",col('major.major_name')),'major_name']],
      include : {
        model : Educational_level
      }
    }]}
    if(addTeacher) includeOpts.include.push({
      model : Teacher,
      attributes : ['id_teacher',[fn('concat',col('name'),' ',col('surname_f'),' ',col('surname_m')),'teacher_name']]
    })
    let extraCourse = await ExtraCurricularCourses.findOne({
      ...includeOpts,
      where: { id_ext_cou }
    })
    const isInactivate = setCourseInactivate(extraCourse)
    if(isInactivate) extraCourse.status = 0
    let {teacher,major:{major_name},...restExtraCourse} =  extraCourse.toJSON()
    return {...restExtraCourse,major_name,...(addTeacher)&&teacher}
}

const getGraduationSectionInfo = async(id_graduation_section) => {
  
  Graduation_section.belongsTo(Teacher,{foreignKey:'id_teacher'})
  Teacher.hasOne(Graduation_section,{foreignKey:'id_teacher'})
  Graduation_section.belongsTo(Graduation_courses,{foreignKey:'id_graduation_course'})
  Graduation_courses.hasOne(Graduation_section,{foreignKey:'id_graduation_course'})

  let graduationSection = await Graduation_section.findOne({
    include : [{
      model:Teacher,
      attributes : ['id_teacher',[fn('concat',col('name'),' ',col('surname_f'),' ',col('surname_m')),'teacher_name']]
    },{
      model : Graduation_courses
    }],
    where:{id_graduation_section},
    raw : true,
    nest : true
  })

  let {id_teacher,id_graduation_course,graduation_course,teacher,...restGraduationSection} = graduationSection
  return {...restGraduationSection,...graduation_course,...teacher};
}

const getGraduationCourseInfo = async(id_graduation_course) => {
  
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
    where:{id_graduation_course},
  })
  const isInactivate = setCourseInactivate(graduationCourse)
  if(isInactivate) graduationCourse.status = 0


  // let {id_teacher,id_graduation_course,graduation_course,teacher,...restGraduationSection} = graduationSection
  // return {...restGraduationSection,...graduation_course,...teacher};
  return graduationCourse.toJSON()
}

const setCourseInactivate = async(entity) => {
  if(moment(entity.end_date).isBefore(moment({})) && entity.status){
    await entity.update({status:0})
    entity.status = 0
  }
  return entity
}

const setSectionInactivate = async(section) =>{
  if(moment(section.end_date).isBefore(moment({})) && section.in_progress){
    await section.update({in_progress:0})
    section.in_progress = 0
  }
  return section
}
module.exports = {
    getRegularCourseInfo,
    getExtraCourseInfo,
    getGraduationCourseInfo,
    getGraduationSectionInfo,
    setCourseInactivate,
    setSectionInactivate
};
