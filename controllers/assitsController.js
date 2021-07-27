const { response } = require("express");
const { printAndSendError } = require("../helpers/responsesOfReq");
const Assit = require("../models/assit");
const Gro_cou = require("../models/gro_cou");
const Gro_cou_ass = require("../models/gro_cou_ass");

const getAllCourseAssistance = async (req, res)=>{
  let {courseName}= req.query;

  Gro_cou_ass.belongsTo(Gro_cou, {foreignKey: 'id_gro_cou'})
  Gro_cou.hasMany(Gro_cou_ass,{foreignKey:'id_gro_cou'})


  // Gro_cou_ass.belongsTo(Gro_cou, {foreignKey: 'id_gro_cou'})
  // Gro_cou.hasMany(Gro_cou_ass,{foreignKey:'id_gro_cou'})

  // Retana pensando...

  // El Cruz dijo que como grades



  try{

      if(courseName==undefined){
          courseName='';
      }
      const courses = await Course.findAll({
          include:{ model: Major, attributes: ['major_name']},
          where: {[Op.or]:[{
              course_name: {[Op.like]: `%${courseName}%`}
          }]}
      });
      return res.status(200).json({//200 means success
          ok: true,
          courses
      })
  } catch(err){
      console.log(err);
      return res.status(500).json({//500 error en el servidor
          ok: false,
          msg: 'Hable con el administrador'
      })
     
  }

}

const takeCourseAssistance = async (req, res = response) => {
  const { id_course } = req.params;
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

}

const deleteCourseAssistence = async (req, res = response)=>{
}

// EXTRACURRICULAR COURSES
const getAllExtracurCourAssistance= async (req, res = response)=>{
}

const takeExtracurCourAssistance= async (req, res = response)=>{
}
const updateExtracurCourAssistance= async (req, res = response)=>{
}
const deleteExtracurCourAssistance= async (req, res = response)=>{
}

// GRADUATION SECTION
const getAllGraSecAssistance= async (req, res = response)=>{
}

const takeGraSecAssistance= async (req, res = response)=>{
}
const updateGraSecAssistance= async (req, res = response)=>{
}
const deleteGraSecAssistance= async (req, res = response)=>{
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
