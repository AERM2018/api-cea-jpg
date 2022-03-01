const moment = require("moment");
const { Op } = require("sequelize");
const Campus = require("../models/campus");
const Educational_level = require("../models/educational_level");
const Group = require("../models/group");
const Major = require("../models/major");
const Student = require("../models/student");

const generateIdAle = (id_user) => {
  const dateId = Date.now().toString().slice(-3);
  return `ale${id_user.toString()}${dateId}`;
};

const generateMatricula = async (id_group, id_campus) => {
  Group.belongsTo(Major, { foreignKey: "id_major" });
  Major.hasMany(Group, { foreignKey: "id_major" });
  Major.belongsTo(Educational_level, { foreignKey: "id_edu_lev" });
  Educational_level.hasMany(Major, { foreignKey: "id_edu_lev" });

  const group = await Group.findByPk(id_group, {
    include: { model: Major, include: { model: Educational_level } },
  });
  const {
    major: { major_name },
  } = group.toJSON();
  const major_name_part = `${major_name.toUpperCase().slice(0, 3)}`;
  const campus = await Campus.findByPk(id_campus);
  const { state, municipality } = campus.toJSON();
  const municipality_part = municipality.toUpperCase().slice(0, 2);
  const date = moment();
  let matricula = `${major_name_part}${municipality_part}${date.year()}${addLeftZeros(
    (date.month() + 1).toString(),
    2
  )}`;
  const student_concidence = await Student.findOne({
    where: { matricula: { [Op.like]: `%${matricula}%` } },
    order: [["id_student", "desc"]],
  });
  if (student_concidence) {
    const lastClaveMatricula =
      parseInt(student_concidence.matricula.slice(-3)) + 1;
    const claveMatriculaFixed = addLeftZeros(lastClaveMatricula.toString(), 3);
    return `${matricula}${claveMatriculaFixed}`;
  }
  return `${matricula}001`;
};

const addLeftZeros = (text, max_length) => {
  let zeros = "";
  for (let i = 0; i < max_length - text.length; i++) {
    zeros += "0";
  }
  return `${zeros}${text}`;
};

module.exports = {
  generateIdAle,
  generateMatricula,
};
