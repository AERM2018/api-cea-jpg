const { Op, fn, col } = require("sequelize");
const { printAndSendError } = require("../helpers/responsesOfReq");
const Educational_level = require("../models/educational_level");
const Major = require("../models/major");

const getAllMajors = async (req, res) => {
  Educational_level.hasOne(Major, { foreignKey: "id_edu_lev" });
  Major.belongsTo(Educational_level, { foreignKey: "id_edu_lev" });
  try {
    let majors = await Major.findAll({
      include: {
        model: Educational_level,
        attributes: [["educational_level", "name"]],
      },
      attributes: [
        "id_major",
        [
          fn("concat", col("educational_level"), " en ", col("major_name")),
          "major_name",
        ],
      ],
    });
    majors = majors.map(({ id_major, major_name }) => ({
      id_major,
      major_name,
    }));
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
    const newMajor = new Major({ major_name, id_edu_lev: edu_level });
    await newMajor.save();
    res.status(200).json({
      ok: true,
      msg: "La carrera se creo correctamente",
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
