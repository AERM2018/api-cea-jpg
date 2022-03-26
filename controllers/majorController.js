const { Op, fn, col } = require("sequelize");
const { getMajorsInfo } = require("../helpers/getDataSavedFromEntities");
const { getGroupCoursesTrack, getGroupInfo } = require("../helpers/groups");
const { printAndSendError } = require("../helpers/responsesOfReq");
const Educational_level = require("../models/educational_level");
const Group = require("../models/group");
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
    const result = await getMajorsInfo(newMajor.id_major);
    res.status(200).json({
      ok: true,
      msg: "La carrera se creo correctamente",
      result,
    });
  } catch (error) {
    printAndSendError(res, error);
  }
};

const updateMajor = async (req, res) => {
  const { id_major } = req.params;
  const { body } = req;
  const { id_edu_lev } = body;
  let { major_name } = body;
  let major_name_fixed = "";
  Educational_level.hasOne(Major, { foreignKey: "id_edu_lev" });
  Major.belongsTo(Educational_level, { foreignKey: "id_edu_lev" });
  try {
    const major = await Major.findByPk(id_major);
    major_name = major_name.split(" ").filter((word) => word !== "");
    major_name.map((word, i) => {
      if (i !== major_name.length - 1) {
        major_name_fixed += word + " ";
      } else {
        major_name_fixed += word;
      }
    });
    const major_name_fixed_split = major_name_fixed.split(" ");
    while (
      ["licenciatura en", "maestría en", "maestria en"].includes(
        "".concat(
          major_name_fixed_split[0].toLowerCase(),
          " ",
          major_name_fixed_split[1].toLowerCase()
        )
      )
    ) {
      major_name_fixed_split.shift();
      major_name_fixed_split.shift();
      major_name_fixed = major_name_fixed_split.join(" ");
    }
    const isMajorWithName = await Major.findOne({
      include: {
        model: Educational_level,
        where: { id_edu_lev },
      },
      where: {
        major_name: major_name_fixed,
        id_major: { [Op.ne]: id_major },
      },
    });
    if (isMajorWithName) {
      return res.status(400).json({
        ok: false,
        msg: `Ya existe una carrera con el nombre ${isMajorWithName.educational_level.educational_level} en ${major_name_fixed}`,
      });
    }
    const educationalLevel = await Educational_level.findByPk(
      parseInt(id_edu_lev)
    );
    if (!educationalLevel) {
      return res.status(400).json({
        ok: false,
        msg: `El nivel de eduación con id ${id_edu_lev} no existe`,
      });
    }
    await major.update({ major_name: major_name_fixed, id_edu_lev });
    const result = await getMajorsInfo(major.id_major);
    res.status(200).json({
      ok: true,
      msg: "La carrera se actualizo correctamente",
      result,
    });
  } catch (error) {
    printAndSendError(res, error);
  }
};

const deleteMajor = async (req, res) => {
  const { id_major } = req.params;
  const { body } = req;

  try {
    const major = await Major.findByPk(id_major);
    if (!major) {
      return res.status(404).json({
        ok: false,
        msg: "No existe una carrera con el id " + id_major,
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

const getMajorGroupsTrack = async (req, res) => {
  const { id_major } = req.params;
  try {
    const majorGroups = await Group.findAll({ where: { id_major } });
    let majorGroupsTrack = [];
    majorGroupsTrack = await Promise.all(
      majorGroups.map(
        async (group) => await getGroupCoursesTrack(group.id_group)
      )
    );
    res.json({
      ok: true,
      groupsTrack: majorGroupsTrack,
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

const getMajorGroups = async (req, res) => {
  const { id_major } = req.params;
  try {
    const majorGroups = await Group.findAll({ where: { id_major } });
    const groupsInfo = await Promise.all(
      majorGroups.map(async (group) => (await getGroupInfo(group.id_group))[0])
    );
    res.json({ ok: true, groups: groupsInfo });
  } catch (err) {
    printAndSendError(res, err);
  }
};
module.exports = {
  getAllMajors,
  createMajor,
  updateMajor,
  deleteMajor,
  getMajorGroupsTrack,
  getMajorGroups,
};
