const { fn, col } = require("sequelize");
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

const getRegularCourseInfo = async(id_gro_cou) => {
 // Buscar información acerca del curso
    Gro_cou.belongsTo(Group, { foreignKey : 'id_group'})
    Group.hasOne(Gro_cou, { foreignKey : 'id_group'})

    Gro_cou.belongsTo(Course, { foreignKey : 'id_course'})
    Course.hasMany(Gro_cou, { foreignKey : 'id_course'})

    Cou_tea.belongsTo(Course, { foreignKey : 'id_course'})
    Course.hasOne(Cou_tea, { foreignKey : 'id_course'})

    Cou_tea.belongsTo(Teacher, { foreignKey : 'id_teacher'})
    Teacher.hasOne(Cou_tea, { foreignKey : 'id_teacher'})
    let course = await Gro_cou.findOne({
        include : [{
          model : Group,
          attributes : ['id_group','name_group']
        },{
          model : Course,
          include : {
            model : Cou_tea,
            include : {
                model : Teacher,
                attributes : ['id_teacher',[fn('concat',col('course.cou_tea.teacher.name'),' ',col('course.cou_tea.teacher.surname_f'),' ',col('course.cou_tea.teacher.surname_m')),'teacher_name']]
              }
          }
        }],
        where : {id_gro_cou},
        raw: true,
        nest:true
    })
    let {id_course,id_group,groupss:{name_group:group_name},course:{course_name,cou_tea}} = course
    return {id_course,course_name,id_group,group_name,...cou_tea.teacher}
}

const getExtraCourseInfo = async(id_ext_cou) => {
    ExtraCurricularCourses.belongsTo(Major,{foreignKey:'id_major'})
    Major.hasOne(ExtraCurricularCourses,{foreignKey:'id_major'})
    ExtraCurricularCourses.belongsTo(Teacher,{foreignKey:'id_teacher'})
    Teacher.hasOne(ExtraCurricularCourses,{foreignKey:'id_teacher'})
    Major.belongsTo(Educational_level,{foreignKey:'id_edu_lev'})
    Educational_level.hasOne(Major,{foreignKey:'id_edu_lev'})

    let extraCourse = await ExtraCurricularCourses.findOne({
      include:[{
        model:Major,
        include : {
          model : Educational_level
        }
      },
      {
        model : Teacher,
        attributes : ['id_teacher',[fn('concat',col('name'),' ',col('surname_f'),' ',col('surname_m')),'teacher_name']]
      }],
      where: { id_ext_cou },
      raw : true,
      nest : true
    })

    let {major:{major_name,educational_level},teacher,...restExtraCourse} =  extraCourse
    return {...restExtraCourse,...teacher,major_name : `${educational_level.educational_level} en ${major_name}`}
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
    raw : true,
    nest : true
  })

  // let {id_teacher,id_graduation_course,graduation_course,teacher,...restGraduationSection} = graduationSection
  // return {...restGraduationSection,...graduation_course,...teacher};
  console.log(graduationCourse)
  return graduationCourse
}
module.exports = {
    getRegularCourseInfo,
    getExtraCourseInfo,
    getGraduationCourseInfo,
    getGraduationSectionInfo
};
