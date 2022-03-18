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
      majorGroups.map(async (group) => await getGroupInfo(group.id_group))
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
