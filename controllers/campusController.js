const { QueryTypes, Op } = require("sequelize");
const { getCampusInfo } = require("../helpers/getDataSavedFromEntities");
const { printAndSendError } = require("../helpers/responsesOfReq");
const Campus = require("../models/campus");

const getAllCampus = async (req, res) => {
  try {
    let campus = await getCampusInfo();
    campus = campus.filter((campus) => campus.active === 1);
    return res.status(200).json({
      ok: true,
      campus,
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

const createCampus = async (req, res) => {
  const { body } = req;
  const { state, municipality, campus_name, zip } = body;

  try {
    // Check if the municipality exist
    const campusMun = await Campus.findOne({
      where: { campus_name },
    });

    if (campusMun) {
      const { id_campus } = campusMun.toJSON();
      if (campusMun.active === 1) {
        return res.status(400).json({
          ok: false,
          msg: `Ya se encuentra registrado un campus con el nombre de ${campus_name}`,
        });
      } else {
        const campusZip = await Campus.findOne({
          where: {
            [Op.and]: [
              {
                zip,
              },
              { id_campus: { [Op.ne]: id_campus } },
            ],
          },
        });

        if (campusZip) {
          return res.status(400).json({
            ok: false,
            msg: `Ya se encuentra registrado un campus con el codigo postal ${zip}`,
          });
        }
        await campusMun.update({ ...body, active: 1 });
        const result = await getCampusInfo(campusMun.id_campus);
        res.status(201).json({
          ok: true,
          msg: "Campus creado correctamente",
          result,
        });
      }
    } else {
      const campusZip = await Campus.findOne({
        where: {
          zip,
        },
      });

      if (campusZip) {
        return res.status(400).json({
          ok: false,
          msg: `Ya se encuentra registrado un campus con el codigo postal ${zip}`,
        });
      }
      //  Create and save course
      const campus = await Campus.create(body);
      const result = await getCampusInfo(campus.id_campus);
      res.status(201).json({
        ok: true,
        msg: "Campus creado correctamente",
        result,
      });
    }
  } catch (err) {
    printAndSendError(res, err);
  }
};

const updateCampus = async (req, res) => {
  const { id } = req.params;
  const { body } = req;
  const { state, municipality, campus_name, zip } = body;

  try {
    const campus = await Campus.findByPk(id);

    if (!campus) {
      return res.status(404).json({
        ok: false,
        msg: `No existe un campus con id ${id}, verifiquelo por favor.`,
      });
    }

    const campusMun = await Campus.findOne({
      where: {
        [Op.and]: {
          campus_name,
          id_campus: { [Op.ne]: id },
        },
      },
    });

    if (campusMun) {
      return res.status(400).json({
        ok: false,
        msg: `Ya se encuentra registrado un campus con el nombre de ${campus_name} `,
      });
    }

    const campusZip = await Campus.findOne({
      where: {
        zip,
        id_campus: { [Op.ne]: id },
      },
    });

    if (campusZip) {
      return res.status(400).json({
        ok: false,
        msg: `Ya se encuentra registrado un campus con el codigo postal ${zip}`,
      });
    }
    // Update record in the database
    await Campus.update(body, {
      where: { id_campus: id },
    });
    const result = await getCampusInfo(campus.id_campus);
    return res.status(200).json({
      ok: true,
      msg: "Campus actualizado correctamente",
      result,
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

const deleteCampus = async (req, res) => {
  const { id } = req.params;

  try {
    const campus = await Campus.findByPk(id);

    // Check if the course exists
    if (!campus) {
      return res.status(404).json({
        ok: false,
        msg: `El campus con id ${id} no existe, verifiquelo por favor.`,
      });
    }

    // Delete the record of the campus
    // await campus.destroy();
    await campus.update({ active: 2 });

    res.status(200).json({
      ok: true,
      msg: "Campus eliminado correctamente",
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

module.exports = {
  getAllCampus,
  createCampus,
  updateCampus,
  deleteCampus,
};
