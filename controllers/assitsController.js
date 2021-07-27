const { response } = require("express");
const { printAndSendError } = require("../helpers/responsesOfReq");
const Assit = require("../models/assit");
const Gro_cou = require("../models/gro_cou");
const Gro_cou_ass = require("../models/gro_cou_ass");

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

      const gro_cou_ass = new Gro_cou_ass({
        id_gro_cou,
        id_assistance,
        id_student,
      });
      await gro_cou_ass.save();

      res.json({
          ok : true,
          msg : "Assitencia tomada correctamente"
      })
    });
  } catch (err) {
      printAndSendError( res, err )
  }
};

module.exports = {
  takeCourseAssistance,
};
