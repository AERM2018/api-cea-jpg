const { response } = require("express");
const { fn, col } = require("sequelize");
const { printAndSendError } = require("../helpers/responsesOfReq");
const Assit = require("../models/assit");
const Course = require("../models/courses");
const ExtraCurricularCourses = require("../models/extracurricularcourses");
const Extracurricularcourse_ass = require("../models/extracurricularcourse_ass");
const Graduation_section = require("../models/graduation_section");
const Gra_sec_ass = require("../models/gra_sec_ass");
const Group = require("../models/group");
const Gro_cou = require("../models/gro_cou");
const Gro_cou_ass = require("../models/gro_cou_ass");
const Student = require("../models/student");

const getAllCourseAssistance = async (req, res)=>{
  let assistence=[ ]
  let {q='', page=1}=req.query
  q = q.split(' ').join('').toLowerCase();

  Gro_cou.belongsTo(Group,{foreignKey:'id_group'})
  Group.hasMany(Gro_cou,{foreignKey:'id_group'})

  Gro_cou.belongsTo(Course,{foreignKey:'id_course'})
  Course.hasMany(Gro_cou,{foreignKey:'id_course'})

  let students = await Student.findAll({
    attributes: ['id_student','matricula', [fn('concat',col('name'),'',col('surname_f'),'',col('surname_m')),'name']],
    limit : [10*(page-1),10]
  })

  students = students.filter((studentItem)=>{
    const {name, matricula, ...restoIteam}=studentItem.toJSON()
    if(name.split(' ').join('').toLowerCase().includes(q)){
      return {
        ...studentItem.toJSON(),
        q:'student_name'
      }
    }else if (matricula.split(' ').join('').toLowerCase().includes(q)){
      return {
        ...studentItem.toJSON(),
        q:'matricula'
      }
    }

  })

  let studentAssistance = students.map(async(studentItem)=>{

    const {id_student}= studentItem;

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

    const courseAssistence = await Gro_cou_ass.findAll({
      include: [{model: Gro_cou, attributes:['id_course'],
        include:{model:Course, attributes: ['course_name']}},
              {model: Assit, attributes: ['id_assistance','date_assistance','attended']} ],
      where: {id_student}
    })

    const extraAssistence = await Extracurricularcourse_ass.findAll({
      include:[{model: ExtraCurricularCourses, attributes:['ext_cou_name']},
                {model: Assit, attributes: ['id_assistance','date_assistance','attended']}],
                where:{id_student}
    })

    const graSecAssistance = await Gra_sec_ass.findAll({
      include: [{model:Graduation_section, attributes:['graduation_section_name']},
                {model:Assit, attributes: ['id_assistance','date_assistance','attended']}],
                where:{id_student}
    })


    return [
      ...courseAssistence,
      ...extraAssistence,
      ...graSecAssistance
    ]
  })

  assistence= [...await Promise.all(studentAssistance)];



  let groCouAss = await Gro_cou.findAll({
    include: [{model: Group},
             {model: Course}
  ],limit : [10*(page-1),10]
})

groCouAss= groCouAss.filter((item)=>{
  const {groupss, course, ...restoIteam}=item.toJSON()
  console.log(item.toJSON())
  if(groupss.name_group.split(' ').join('').toLowerCase().includes(q)){
    return {
      name_group: groupss.name_group,
      course_name: course.course_name,
      q:'group_name'

    }
  }else if(course.course_name.split(' ').join('').toLowerCase().includes(q)){
    return{
      name_group: groupss.name_group,
      course_name: course.course_name,
      q:'course_name'
    }  
  }return

})

// Filtar por nombre extracurso
// Filtrar por nombre

assistence= [...assistence, ...groCouAss]

res.json({
  ok:true,
  assistence
  
})

}

const takeCourseAssistance = async (req, res = response) => {
  const { id_course } = req.params; //id_ext_cou
  const { studentsList, id_group } = req.body;
  try {
    const { id_gro_cou } = await Gro_cou.findOne({
      where: { id_course, id_group },
      attributes: ["id_gro_cou"],
    });
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
          msg : "Assitencia tomada correctamente"
      })
  } catch (err) {
      printAndSendError( res, err )
  }
};

const updateCourseAssitence = async (req, res = response)=>{

  const { id_gro_cou_ass } = req.params;
  const { attended } = req.body;
  try {
      const assit = new Assit({ attended });
      const { id_assistance } = await assit.update({attended},{where: {[Op.and]:[{id_gro_cou_ass},{id_assistance},{id_student}]}});

      // Guardado en gro_cou_ass
      // const gro_cou_ass = new Gro_cou_ass({
      //   // id_gro_cou,
      //   // id_assistance,
      //   id_student,
      // });
      // await assit.update({attended},{where: {id_assistance} });
      res.json({
          ok : true,
          msg : "..."
      })
  } catch (err) {
      printAndSendError( res, err )
  }

}

const deleteCourseAssistence = async (req, res = response)=>{
  const { id_gro_cou_ass} = req.params;
  const { body } = req;

  try {
      const courseAssistance = await Gro_cou_ass.findByPk(id_gro_cou_ass);
      if (!courseAssistance) {
          return res.status(404).json({
              ok:false,
              msg: "No existe un registro de asistencia con el id " + id_gro_cou_ass,
          });
      }
  
      await courseAssistance.destroy(body);
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

// EXTRACURRICULAR COURSES
const getAllExtracurCourAssistance= async (req, res = response)=>{
}

const takeExtracurCourAssistance= async (req, res = response)=>{
  const {id_ext_cou} = req.params; //id_ext_cou
  const { studentsList} = req.body;
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
const getAllGraSecAssistance= async (req, res = response)=>{
}

const takeGraSecAssistance= async (req, res = response)=>{
  const {id_graduation_section} = req.params;
  const { studentsList} = req.body;
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
const updateGraSecAssistance= async (req, res = response)=>{
}
const deleteGraSecAssistance= async (req, res = response)=>{
  const { id_gra_sec_ass} = req.params;
  const { body } = req;

  try {
      const graSecAss = await Gra_sec_ass.findByPk(id_gra_sec_ass);
      if (!graSecAss) {
          return res.status(404).json({
              ok:false,
              msg: "No existe un registro de asistencia con el id " + id_gra_sec_ass,
          });
      }
  
      await graSecAss.destroy(body);
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


module.exports = {
  takeCourseAssistance,
  getAllCourseAssistance,
  updateCourseAssitence,
  deleteCourseAssistence,
  getAllExtracurCourAssistance,
  takeExtracurCourAssistance,
  updateExtracurCourAssistance,
  deleteExtracurCourAssistance,
  getAllGraSecAssistance,
  takeGraSecAssistance,
  updateGraSecAssistance,
  deleteGraSecAssistance

};
