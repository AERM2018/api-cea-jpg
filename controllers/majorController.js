const { Op, fn, col } = require("sequelize");
const { getMajorsInfo } = require("../helpers/getDataSavedFromEntities");
const { printAndSendError } = require("../helpers/responsesOfReq");
const Educational_level = require("../models/educational_level");
const Major = require("../models/major");

const getAllMajors = async (req, res) => {
  try {
    const majors = await getMajorsInfo();
    return res.status(200).json({
      ok: true,
      majors,
    });
  } catch (error) {
    printAndSendError(res, error);
  }
};

const createMajor = async (req, res) => {
  const { major_name, edu_level } = req.body;
  try {
    const major = await Major.findOne({
      where: {
        major_name,
      },
    });
    if (major) {
      return res.status(500).json({
        ok: false,
        msg: `Ya existe una carrera con el nombre '${major_name}'`,
      });
    }
    const newMajor = await Major.create({ major_name, id_edu_lev: edu_level });
    const majorDB = await getMajorsInfo(newMajor.id_major);
    res.status(200).json({
      ok: true,
      msg: "La carrera se creo correctamente",
      major: majorDB,
    });
  } catch (error) {
    printAndSendError(res, error);
  }
};

const updateMajor = async (req, res) => {
  const { id } = req.params;
  const { body } = req;
  const { major_name, edu_level } = body;
  try {
    const major = await Major.findByPk(id);
    if (!major) {
      return res.status(404).json({
        ok: false,
        msg: "No existe una carrera con el id " + id,
      });
    }
    const majorName = await Major.findOne({
      where: {
        major_name,
        id_major: { [Op.ne]: id },
      },
    });

    if (majorName) {
      return res.status(400).json({
        ok: false,
        msg: `Ya existe una carrera con el nombre ${major_name}`,
      });
    }

    await major.update({ major_name, id_edu_lev: edu_level });

    res.status(200).json({
      ok: true,
      msg: "La carrera se actualizo correctamente",
    });
  } catch (error) {
    printAndSendError(res, error);
  }
};

const deleteMajor = async (req, res) => {
  const { id } = req.params;
  const { body } = req;

  try {
    const major = await Major.findByPk(id);
    if (!major) {
      return res.status(404).json({
        ok: false,
        msg: "No existe una carrera con el id " + id,
      });
    }

    await major.destroy(body);
    res.status(200).json({
      ok: true,
      msg: "La carrera se elimino correctamente",
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

module.exports = {
  getAllMajors,
  createMajor,
  updateMajor,
  deleteMajor,
};
