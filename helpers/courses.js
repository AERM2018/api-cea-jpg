const { fn, col, Op,where,literal } = require("sequelize");
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
  const {start_date,end_date,status} = entity.toJSON()
  if(moment(end_date).isBefore(moment({})) && status){
    // When a record in gro_cou is overdue, set status = 0 the records with the same dates in cou_tea
    await Cou_tea.update(
      {status:0},
      {where : {[Op.and]:[
        {start_date:{[Op.eq]:start_date}},
        {end_date:{[Op.eq]:end_date}}
      ]}})
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

const getCoursesGiveTeachersOrTeacher = async(query={courseName,teacherName,id_teacher,status:''}) => {
  const {courseName,teacherName,id_teacher,status} = query
  const statusCondition = (status == 'all')  ? {} : {status}
  const withTeacher = (id_teacher==undefined) ? true : false
  const teacherAssosiation = {
    model : Teacher,
    attributes: ['id_teacher',[fn('CONCAT',col('teacher.name'),' ', col('teacher.surname_f'),' ',col('teacher.surname_m')),'teacher_name']],
    where : where(literal(`(CONCAT(LOWER(${col('teacher.name').col}),' ', LOWER(${col('teacher.surname_f').col}),' ', LOWER(${col('teacher.surname_m').col})))`),
    {[Op.like]:`%${teacherName}%`})
  }
  // Regular courses
  Cou_tea.belongsTo(Teacher,{foreignKey:'id_teacher'})
  Teacher.hasOne(Cou_tea,{foreignKey:'id_teacher'})
  Cou_tea.belongsTo( Course, { foreignKey : 'id_course'})
  Course.hasOne( Cou_tea, { foreignKey : 'id_course'})
  let coursesTeacherGiven =  await Cou_tea.findAll({
      include:[{
          model : Course,
          attributes : ['course_name'],
          where : {course_name:{[Op.like]:`%${courseName}%`}}
      },
      ...(withTeacher)?[teacherAssosiation]:[]],
      attributes : ['id_course','status','start_date','end_date'],
      where : { ...(id_teacher)?{id_teacher}:{} },

  })
  coursesTeacherGiven = await Promise.all(coursesTeacherGiven.map( async(course) => {
      const { id_course,start_date,end_date, teacher,...restoCourse} = course.toJSON()
      const gro_cou = await Gro_cou.findOne({
          where : {
              id_course,
              start_date,
              end_date,
              ...statusCondition
          }
      })
      if(!gro_cou) return
      let courseData = await getRegularCourseInfo({id_gro_cou:gro_cou.id_gro_cou})
      if(withTeacher) courseData = {...courseData,...teacher}
      courseData.type='regular'
      return courseData
  }))
  coursesTeacherGiven = coursesTeacherGiven.filter( course => course )
  // Extracurricular courses
  ExtraCurricularCourses.belongsTo(Teacher,{foreignKey:'id_teacher'})
  Teacher.hasOne(ExtraCurricularCourses,{foreignKey:'id_teacher'})
  let extCoursesTeacherGiven = await ExtraCurricularCourses.findAll({
      ...(withTeacher)?{include:teacherAssosiation}:{},
      where : { ...(id_teacher)?{id_teacher}:{}, ext_cou_name:{[Op.like]:`%${courseName}%`},...statusCondition }, attributes : ['id_ext_cou'],
      raw : true,
      nest : true
  })
  extCoursesTeacherGiven = await Promise.all(extCoursesTeacherGiven.map( async(extra_course) => {
      const {id_ext_cou,teacher} = extra_course
      let extraCourseInfo = await getExtraCourseInfo({id_ext_cou})
      if(withTeacher) extraCourseInfo = {...extraCourseInfo,...teacher}
      return {id_ext_cou,...extraCourseInfo,type:'extra'}
  }))
  // // Graduation courses
  Graduation_section.belongsTo(Graduation_courses, {foreignKey : 'id_graduation_course'})
  Graduation_courses.hasMany(Graduation_section, {foreignKey : 'id_graduation_course'})
  Graduation_section.belongsTo(Teacher, {foreignKey : 'id_teacher'})
  Teacher.hasOne(Graduation_section, {foreignKey : 'id_teacher'})
  Graduation_courses.belongsTo(Teacher,{foreignKey:'id_teacher'})
  Teacher.hasOne(Graduation_courses,{foreignKey:'id_teacher'})
  let gradCoursesTeacherGiven = await Graduation_courses.findAll({
      include : [{
        model : Graduation_section,
        attributes :{ exclude : [ 'id_graduation_course']},
        where :{  ...(id_teacher)?{id_teacher}:{}, ...(statusCondition=={})&&{in_progress:statusCondition.status} },
        required : false,
        ...(withTeacher)?[{include : teacherAssosiation}]:[],
        include : {
          model : Teacher,
          attributes : ['id_teacher',[fn('concat',col('graduation_sections.teacher.name'),' ',col('graduation_sections.teacher.surname_f'),' ',col('graduation_sections.teacher.surname_m')),'teacher_name']]
      }
      },
      ...[teacherAssosiation]
  ],
      where : where(literal(`(((SELECT COUNT(id_graduation_section) FROM graduation_sections WHERE ${(id_teacher)?`id_teacher ='${id_teacher}'`:true} AND ${col('graduation_section.id_graduation_course') == col('graduation_course.id_graduation_course')}) > 0) or (${(id_teacher)?`(graduation_courses.id_teacher = '${id_teacher}')`:true}) AND ${col('course_grad_name').col} LIKE '%${courseName}%' ${(status!='all')?` AND status = ${status}`:''})`),true)
  })
  gradCoursesTeacherGiven = await Promise.all( gradCoursesTeacherGiven.map( async(course) => {
      let {teacher,...coursesInfoJSON} = course.toJSON()
      coursesInfoJSON.graduation_sections = await Promise.all( course.graduation_sections.map(async(section) => {
          section = await setSectionInactivate(section)
          if(status!='all' && !section.in_progress) return
          const {teacher,...sectionInfo}=section.toJSON()
          return {...sectionInfo,...teacher}
      }))
      coursesInfoJSON.graduation_sections = coursesInfoJSON.graduation_sections.filter(section => section)
      course = await setCourseInactivate(course)
      if(!course.status && status!='all') return
      coursesInfoJSON.teacher_name = teacher.teacher_name
      coursesInfoJSON.isTeacherTitular = (coursesInfoJSON.id_teacher == id_teacher) ? 1 : 0
      coursesInfoJSON.type = 'graduation_course'
      return coursesInfoJSON
  }))
  gradCoursesTeacherGiven = gradCoursesTeacherGiven.filter( graduation_course => graduation_course)
  return [...coursesTeacherGiven,...extCoursesTeacherGiven,...gradCoursesTeacherGiven]
}

module.exports = {
    getRegularCourseInfo,
    getExtraCourseInfo,
    getGraduationCourseInfo,
    getGraduationSectionInfo,
    setCourseInactivate,
    setSectionInactivate,
    getCoursesGiveTeachersOrTeacher
};
