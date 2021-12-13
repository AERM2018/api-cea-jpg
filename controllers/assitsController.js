const { response } = require("express");
const { fn, col, literal, Op } = require("sequelize");
const { getRegularCourseInfo, getGraduationSectionInfo } = require("../helpers/courses");
const { printAndSendError } = require("../helpers/responsesOfReq");
const Assit = require("../models/assit");
const Course = require("../models/courses");
const Cou_tea = require("../models/cou_tea");
const ExtraCurricularCourses = require("../models/extracurricularcourses");
const Extracurricularcourse_ass = require("../models/extracurricularcourse_ass");
const Graduation_courses = require("../models/graduation_courses");
const Graduation_section = require("../models/graduation_section");
const Gra_sec_ass = require("../models/gra_sec_ass");
const Group = require("../models/group");
const Gro_cou = require("../models/gro_cou");
const Gro_cou_ass = require("../models/gro_cou_ass");
const Student = require("../models/student");
const Stu_extracou = require("../models/stu_extracou");
const Stu_gracou = require("../models/stu_gracou");
const Teacher = require("../models/teacher");

const getAllAssistance = async (req, res)=>{
  let assistence=[ ]
  let {q='', page=1}=req.query
  q = q.split(' ').join('').toLowerCase();

  Gro_cou.belongsTo(Group,{foreignKey:'id_group'})
  Group.hasMany(Gro_cou,{foreignKey:'id_group'})
  Gro_cou.belongsTo(Course,{foreignKey:'id_course'})
  Course.hasMany(Gro_cou,{foreignKey:'id_course'})

  Extracurricularcourse_ass.belongsTo(ExtraCurricularCourses,{foreignKey:'id_ext_cou'})
  ExtraCurricularCourses.hasMany(Extracurricularcourse_ass,{foreignKey:'id_ext_cou'})

  Gra_sec_ass.belongsTo(Graduation_section,{foreignKey:'id_graduation_section'})
  Graduation_section.hasMany(Gra_sec_ass,{foreignKey:'id_graduation_section'})

  let students = await Student.findAll({
    attributes: ['id_student','matricula', [fn('concat',col('name'),' ',col('surname_f'),' ',col('surname_m')),'name']],
    limit : [10*(page-1),10]
  })

  students = students.filter((studentItem)=>{
    const {name, matricula, ...restoIteam}=studentItem.toJSON()
    if(name.split(' ').join('').toLowerCase().includes(q)){
      studentItem.q = 'student_name'
      return studentItem
    }else if (matricula.split(' ').join('').toLowerCase().includes(q)){
      studentItem.q = 'matricula'
      return studentItem
    }

  })

  students = students.map( student => ({...student.toJSON(),q:student.q}))
  
  // Filtrado por grupo y curso
  let groCou = await Gro_cou.findAll({
    include: [{model: Group},{model: Course}],
    // where : { id_gro_cou : {[Op.in] : literal('(SELECT id_gro_cou FROM gro_cou_ass GROUP BY id_gro_cou)')}},
    limit : [10*(page-1),10]
})

groCou = groCou.filter( ass => {
  const {groupss, course} = ass.toJSON()
  if(groupss.name_group.split(' ').join('').toLowerCase().includes(q)){
    ass.q = 'group_name'
    return ass
  }else if(course.course_name.split(' ').join('').toLowerCase().includes(q)){
    ass.q = 'course_name'
    return ass
  } return
  }
)

groCou= groCou.map((ass)=>{
  const {groupss, course, id_gro_cou,...restoIteam}=ass.toJSON()
  console.log(ass.toJSON())
    return {
      id_gro_cou,
      id_group : groupss.id_group,
      name_group: groupss.name_group,
      id_course : course.id_course,
      course_name: course.course_name,
      q : ass.q

    }
})

// Filtado por nombre de extracurricular course 

    let extraCou = await ExtraCurricularCourses.findAll({
      // where : { id_ext_cou : {[Op.in] : literal('(SELECT id_ext_cou FROM extracurricularcourses_ass GROUP BY id_ext_cou)')} },
      limit : [10*(page-1),10]
    })

    extraCou = extraCou.filter( extraCou => {
      const extraCouJSON = extraCou.toJSON()
      if(extraCouJSON.ext_cou_name.split(' ').join('').toLowerCase().includes(q)){
        extraCou.q = 'ext_cou_name'
        return extraCou
      }
      return
    })

    extraCou= extraCou.map((extra)=>{
      const extraJSON = extra.toJSON()
        return {
          id_ext_cou : extraJSON.id_ext_cou,
          ext_cou_name: extraJSON.ext_cou_name,
          q: extra.q
      }
    })

// Filtrado por nombre de graduation section
    let graSec = await Graduation_section.findAll({
      // where : { id_graduation_section : { [Op.in] : literal('(SELECT id_graduation_section FROM gra_sec_ass GROUP BY id_graduation_section)')}},
      limit : [10*(page-1),10]
    })

    graSec = graSec.filter( graSec => {
      const graSecJSON = graSec.toJSON()
      if(graSecJSON.graduation_section_name.split(' ').join('').toLowerCase().includes(q)){
          graSec.q = 'graduation_section_name'
          return graSec
      }
      return
    })

    graSec= graSec.map((graSec)=>{
      const graSecJSON = graSec.toJSON()
        return {
          id_graduation_section : graSecJSON.id_graduation_section,
          graduation_section_name: graSecJSON.graduation_section_name,
          q:'graduation_section_name'
      }
    })

assistence= [...students, ...groCou, ...extraCou, ...graSec]

res.json({
  ok:true,
  results : assistence
})

}

const getAllAssistanceByStudent = async(req, res) => {
  const { id_student } = req.params;

  Gro_cou_ass.belongsTo(Gro_cou,{foreignKey:'id_gro_cou'})
  Gro_cou.hasMany(Gro_cou_ass,{foreignKey:'id_gro_cou'})
  Gro_cou.belongsTo(Course,{foreignKey:'id_course'})
  Course.hasMany(Gro_cou,{foreignKey:'id_course'})

  Gro_cou_ass.belongsTo(Assit,{foreignKey:'id_assistance'})
  Assit.hasMany(Gro_cou_ass,{foreignKey:'id_assistance'})
  Extracurricularcourse_ass.belongsTo(Assit,{foreignKey:'id_assistance'})
  Assit.hasMany(Extracurricularcourse_ass,{foreignKey:'id_assistance'})

  Extracurricularcourse_ass.belongsTo(ExtraCurricularCourses,{foreignKey:'id_ext_cou'})
  ExtraCurricularCourses.hasMany(Extracurricularcourse_ass,{foreignKey:'id_ext_cou'})

  Gra_sec_ass.belongsTo(Assit,{foreignKey:'id_assistance'})
  Assit.hasMany(Gra_sec_ass,{foreignKey:'id_assistance'})
  Gra_sec_ass.belongsTo(Graduation_section,{foreignKey:'id_graduation_section'})
  Graduation_section.hasMany(Gra_sec_ass,{foreignKey:'id_graduation_section'})

  let courseAssistence = await Gro_cou_ass.findAll({
    include: [{model: Gro_cou, attributes:['id_course'],
      include:{model:Course, attributes: ['course_name']}},
            {model: Assit, attributes: ['id_assistance','date_assistance','attended']} ],
    where: {id_student}
  })

  courseAssistence= courseAssistence.map((ass)=>{
    const {gro_cou,assit,id_gro_cou_ass,id_assistance,id_student} = ass.toJSON()
    return {
      // id_gro_cou:gro_cou,
      id_assistance,
      id_student,
      id_course : gro_cou.id_course,
      course_name : gro_cou.course.course_name,
      ...assit,
      assType: "Regular Course"}
  })

  let extraAssistence = await Extracurricularcourse_ass.findAll({
    include:[{model: ExtraCurricularCourses, attributes:['ext_cou_name','id_ext_cou']},
              {model: Assit, attributes: ['id_assistance','date_assistance','attended']}],
              where:{id_student}
  })
  extraAssistence = extraAssistence.map((ass)=>{
    const {extracurricular_course,assit,id_assistance,id_student} = ass.toJSON()
    return {
      id_assistance,
      id_student,
      id_ext_cou : extracurricular_course.id_ext_cou,
      extracurricular_course_name : extracurricular_course.ext_cou_name,
      ...assit,
      assType: "Extracurricular Course"}
  })

  let graSecAssistance = await Gra_sec_ass.findAll({
    include: [{model:Graduation_section, attributes:['graduation_section_name','id_graduation_section']},
              {model:Assit, attributes: ['id_assistance','date_assistance','attended']}],
              where:{id_student}
  })

  graSecAssistance=graSecAssistance.map((ass)=>{
    const {graduation_section,assit,id_assistance,id_student} = ass.toJSON()
    return {
      id_assistance,
      id_student,
      id_graduation_section : graduation_section.id_graduation_section,
      graduation_section_name : graduation_section.graduation_section_name,
      ...assit,
      assType: "Graduation Section Course"}
    
  })

  const assistence =  [
    ...courseAssistence,
    ...extraAssistence,
    ...graSecAssistance
  ]

  return res.json({
    ok : true,
    assistence
  })
}

const getCourseAssistance =  async(req, res) => {
  const { id_gro_cou } = req.params

  try {

    Gro_cou_ass.belongsTo(Student,{ foreignKey : 'id_student'});
    Student.hasMany(Gro_cou_ass,{ foreignKey : 'id_student'});
  
    Gro_cou_ass.belongsTo(Assit,{foreignKey:'id_assistance'})
    Assit.hasOne(Gro_cou_ass,{foreignKey:'id_assistance'})
  
    let courseInfo = await getRegularCourseInfo(id_gro_cou)
    let students_group_ass = await Gro_cou_ass.findAll({
      include:[{
        model : Student,
        attributes : ['id_student','matricula',[fn('concat',col('name'),' ',col('surname_f'),' ',col('surname_m')),'student_name']],
      },{
        model: Assit
      }],
      where : {id_gro_cou},
      raw : true,
      nest: true
    });
    let studentAssistance = [];
    while(students_group_ass.length > 0){
      studentAssistance.push(students_group_ass[0].student)
      studentAssistance[studentAssistance.length - 1] = {...studentAssistance[studentAssistance.length - 1],assistences:students_group_ass.filter( (assistence) => assistence.id_student == studentAssistance[studentAssistance.length - 1].id_student).map( (assistence) => assistence.assit)}
      students_group_ass = students_group_ass.filter((assistence)=>assistence.id_student != studentAssistance[studentAssistance.length - 1].id_student)
    }
    return res.json({
      ok : true,
      ...courseInfo,
      students : studentAssistance,
    })
  } catch ( err ) {
    printAndSendError(res, err)
  }

}

const takeCourseAssistance = async (req, res = response) => {
  const { studentsList, id_gro_cou } = req.body;
  try {
    
    studentsList.map(async (student) => {
      const { id_student, attended } = student;
      const assit = new Assit({ attended });
      const { id_assistance } = await assit.save();

      // Guardado en gro_cou_ass

      const gro_cou_ass = new Gro_cou_ass({
        id_gro_cou,
        id_assistance,
        id_student,
      });
      await gro_cou_ass.save();

    });
      res.json({
          ok : true,
          msg : "Assitencia de curso tomada correctamente"
      })
  } catch (err) {
      printAndSendError( res, err )
  }
};

const updateAssitence = async (req, res = response)=>{
  // usar id_assistance
  // ¿Este se puede usar para todos los cursos?

    const { id_assistance } = req.params;
    const { date_assistance, attended }= req.body;

    try {
        await Assit.update({date_assistance, attended},{where: {id_assistance} });

        res.json({
            ok:true,
            msg: 'Asistencia actualizada correctamente.'
        })
        
    } catch (err) {

    printAndSendError(res,err)
        
    }
}

const deleteAssistence = async (req, res = response)=>{
const {id_assistance}=req.params;

try{
  let result ;
  
    result = await Gro_cou_ass.findOne({
      where:{ id_assistance}
    })
  
    if(!result){
      result = await Extracurricularcourse_ass.findOne({
        where:{ id_assistance}
      })
      if(!result){
        result = await Gra_sec_ass.findOne({
          where:{ id_assistance}
        })
      }
    }
      
    
  // console.log(id_assistance)
  // Delete the record of the course
  await result.destroy();
  await Assit.destroy({
    where:{ id_assistance}
  });


  res.status(200).json({
      ok : true,
      msg : 'Asistencia eliminada correctamente'
  })

}catch( err ){
  console.log(err)
  return res.status(500).json({
      ok : false,
      msg : 'Hable con el administrador'
  })
}

}

// EXTRACURRICULAR COURSES
const getExtrCourAssistance= async (req, res = response)=>{
  const { id_ext_cou } = req.params

  try {
    Stu_extracou.belongsTo(ExtraCurricularCourses,{ foreignKey : 'id_ext_cou'});
    ExtraCurricularCourses.hasMany(Stu_extracou,{ foreignKey : 'id_ext_cou'});
  
    
    ExtraCurricularCourses.belongsTo(Teacher,{foreignKey:'id_teacher'})
    Teacher.hasOne(ExtraCurricularCourses,{foreignKey:'id_teacher'})
    
    Extracurricularcourse_ass.belongsTo(ExtraCurricularCourses,{foreignKey:'id_ext_cou'})
    ExtraCurricularCourses.hasMany(Extracurricularcourse_ass,{foreignKey:'id_ext_cou'})
    
    Extracurricularcourse_ass.belongsTo(Student,{ foreignKey : 'id_student'});
    Student.hasMany(Extracurricularcourse_ass,{ foreignKey : 'id_student'});
  
    Extracurricularcourse_ass.belongsTo(Assit,{foreignKey:'id_assistance'})
    Assit.hasOne(Extracurricularcourse_ass,{foreignKey:'id_assistance'})
  
    // Buscar información acerca del curso
    let extraCourse = await ExtraCurricularCourses.findOne({
      include : {
        model : Teacher,
        attributes : ['id_teacher',[fn('concat',col('teacher.name'),' ',col('teacher.surname_f'),' ',col('teacher.surname_m')),'teacher_name']],
      },
      where : {id_ext_cou}
    })
  
    extraCourse = {
      id_ext_cou : extraCourse.toJSON().id_ext_cou,
      ...extraCourse.toJSON().teacher
    }
  
    // Buscar la assistencia del curso
    let assistence = await Extracurricularcourse_ass.findAll({
          include : [{
            model : Student,
            attributes : ['id_student','matricula',[fn('concat',col('student.name'),' ',col('student.surname_f'),' ',col('student.surname_m')),'student_name']]
          },{
            model : Assit
          }]
          ,where : {id_ext_cou},
          raw :true,
          nest: true
    });
    let studentAssistance = [];
    while (assistence.length > 0){
        studentAssistance.push(assistence[0].student)
        studentAssistance[studentAssistance.length - 1] = {...studentAssistance[studentAssistance.length - 1],assistences:assistence.filter( (assistence) => assistence.id_student == studentAssistance[studentAssistance.length - 1].id_student).map( (assistence) => assistence.assit)}
        assistence = assistence.filter((assistence)=>assistence.id_student != studentAssistance[studentAssistance.length - 1].id_student)
    }
    // assistence = assistence.map( ass => {
    //   const {student,assit} = ass.toJSON()
    //     return {
    //       ...student,
    //       ...assit
    //     }
    // })
    return res.json({
      ok : true,
        ...extraCourse,
        students:studentAssistance
      
    })
  } catch ( err ) {
    printAndSendError(res, err)
  }
}

const takeExtracurCourAssistance= async (req, res = response)=>{
  const {id_ext_cou, studentsList} = req.body;
  try {
    studentsList.map(async (student) => {
      const { id_student, attended } = student;
      const assit = new Assit({ attended });
      const { id_assistance } = await assit.save();

      // Guardado en extracurricularcourses_ass
      const extracurricularcourses_ass = new Extracurricularcourse_ass({
        id_ext_cou,
        id_assistance,
        id_student,
      });
      await extracurricularcourses_ass.save();

    });
      res.json({
          ok : true,
          msg : "Assitencia de curso extra curricular tomada correctamente"
      })
  } catch (err) {
      printAndSendError( res, err )
  }
}
const updateExtracurCourAssistance= async (req, res = response)=>{
}
const deleteExtracurCourAssistance= async (req, res = response)=>{
  const { id_extracurricularcourses_ass} = req.params;
  const { body } = req;

  try {
      const extraCurCouAss = await Extracurricularcourse_ass.findByPk(id_extracurricularcourses_ass);
      if (!extraCurCouAss) {
          return res.status(404).json({
              ok:false,
              msg: "No existe un registro de asistencia con el id " + id_extracurricularcourses_ass,
          });
      }
  
      await extraCurCouAss.destroy(body);
      res.status(200).json({
          ok: true,
          msg: "La asistencia se elimino correctamente",
          
      })
  } catch ( err ) {
      console.log(err)
      return res.status(500).json({
          msg: "Hable con el administrador"
      })
  }
}

// GRADUATION SECTION
const getGraSecAssistance= async (req, res = response)=>{
  const { id_graduation_section } = req.params

  try {
    Stu_gracou.belongsTo(Graduation_courses,{ foreignKey : 'id_graduation_course'});
    Graduation_courses.hasMany(Stu_gracou,{ foreignKey : 'id_graduation_course'});
    
    Gra_sec_ass.belongsTo(Graduation_section,{foreignKey:'id_graduation_section'})
    Graduation_section.hasOne(Gra_sec_ass,{foreignKey:'id_graduation_section'})
    
    Gra_sec_ass.belongsTo(Student,{ foreignKey : 'id_student'});
    Student.hasMany(Gra_sec_ass,{ foreignKey : 'id_student'});
    
    Gra_sec_ass.belongsTo(Assit,{foreignKey:'id_assistance'})
    Assit.hasMany(Gra_sec_ass,{foreignKey:'id_assistance'})
    
    let graduationSectionInfo = await getGraduationSectionInfo(id_graduation_section)
    // Buscar asitencia de la sección del curso de graduación
    let assistence = await Gra_sec_ass.findAll({
            include : [{
              model : Student,
              attributes : ['id_student','matricula',[fn('concat',col('student.name'),' ',col('student.surname_f'),' ',col('student.surname_m')),'student_name']]
            },{
              model : Assit
            }],
      where : {id_graduation_section},
      raw: true,
      nest : true
    });
    let studentAssistance = [];
      while (assistence.length > 0){
          studentAssistance.push(assistence[0].student)
          studentAssistance[studentAssistance.length - 1] = {...studentAssistance[studentAssistance.length - 1],assistences:assistence.filter( (assistence) => assistence.id_student == studentAssistance[studentAssistance.length - 1].id_student).map( (assistence) => assistence.assit)}
          assistence = assistence.filter((assistence)=>assistence.id_student != studentAssistance[studentAssistance.length - 1].id_student)
      }
    return res.json({
      ok : true,
        ...graduationSectionInfo,
        students:studentAssistance
      
    })
  } catch ( err ) {
    printAndSendError(res,err)
  }
  
}

const takeGraSecAssistance= async (req, res = response)=>{
  const {id_graduation_section, studentsList} = req.body;
  try {
    studentsList.map(async (student) => {
      const { id_student, attended } = student;
      const assit = new Assit({ attended });
      const { id_assistance } = await assit.save();

      // Guardado en gra_sec_ass
      const gra_sec_ass = new Gra_sec_ass({
        id_graduation_section,
        id_assistance,
        id_student,
      });
      await gra_sec_ass.save();

    });
      res.json({
          ok : true,
          msg : "Assitencia de la sección de curso de graduación tomada correctamente"
      })
  } catch (err) {
      printAndSendError( res, err )
  }
}



module.exports = {
  takeCourseAssistance,
  getAllAssistance,
  getCourseAssistance,
  updateAssitence,
  deleteAssistence,
  getExtrCourAssistance,
  getAllAssistanceByStudent,
  takeExtracurCourAssistance,
  updateExtracurCourAssistance,
  deleteExtracurCourAssistance,
  getGraSecAssistance,
  takeGraSecAssistance,

};
