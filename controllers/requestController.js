const moment = require("moment");
const Document = require("../models/document");
const Payment = require("../models/payment");
const Request = require("../models/request");
const Stu_pay = require("../models/stu_pay");
const Req_pay = require("../models/req_pay");
const Student = require("../models/student");
const { QueryTypes, where, fn, col, literal, Op } = require("sequelize");
const { getStuInfo } = require("../queries/queries");
const { db } = require("../database/connection");
const { document_types } = require("../types/dictionaries");
const Partial_pay = require("../models/partial_pay");
const Emp_par_pay = require("../models/emp_pay");
const { response } = require("express");
const { getRequests } = require("../helpers/requests");
const { printAndSendError } = require("../helpers/responsesOfReq");
moment().locale("es");
const getAllTheRequests = async (req, res) => {
  try {
    let { date = moment().local().format("YYYY-MM-DD"), status = "all" } =
      req.query;
    const estado =
      status !== undefined ? (status ? "finalizado" : "no finalizada") : "";
    const requestsFound = await getRequests({ status, date });
    if (!requestsFound) {
      return res.status(400).json({
        ok: false,
        msg:
          "No existen peticiones de la fecha " +
          date +
          "con el estado " +
          estado,
      });
    }
    return res.status(200).json({
      ok: true,
      requests: requestsFound,
    });
  } catch (error) {
    printAndSendError(res, error);
  }
};

const createRequest = async (req, res) => {
  const { document_type } = req.body;
  const { id_student } = req;
  try {
    const doc_info = new Document({
      document_type,
      cost: document_types.find((doc_type) => doc_type.id === document_type)
        .price,
      id_student,
    });
    const doc = await doc_info.save();
    const { id_document, cost } = doc.toJSON();

    const payment_info = new Payment({
      payment_type: "Documento",
      status_payment: 0,
      cutoff_date: moment()
        .endOf("month")
        .local()
        .format("YYYY-MM-DD")
        .toString(),
      payment_date: null,
      amount: cost,
      start_date: moment()
        .startOf("month")
        .local()
        .format("YYYY-MM-DD")
        .toString(),
    });
    const payment = await payment_info.save();
    const { id_payment } = payment.toJSON();

    const stu_pay = new Stu_pay({ id_payment, id_student });
    await stu_pay.save();

    const partial_pay = new Partial_pay({
      id_payment,
      id_card: null,
      amount_p: 0,
      payment_method: "Efectivo",
      date_p: moment().local().format().substr(0, 10),
    });

    await partial_pay.save();

    const request = new Request({
      id_document,
      id_payment,
    });

    await request.save();

    return res.status(201).json({
      ok: true,
      msg: "Solcitud creada correctamente",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      ok: false,
      msg: "Hable con el administrador",
    });
  }
};

const completeARequest = async (req, res = response) => {
  const { id_request } = req.params;
  Request.belongsTo(Document, { foreignKey: "id_document" });
  Document.hasOne(Request, { foreignKey: "id_document" });
  try {
    const request = await Request.findOne({
      where: { id_request: id_request },
      include: {
        model: Document,
        attributes: [
          "document_type",
          [
            literal(
              `(SELECT matricula FROM students WHERE id_student = document.id_student)`
            ),
            "matricula",
          ],
        ],
      },
      raw: true,
      nest: true,
    });
    if (!request) {
      return res.status(400).json({
        ok: false,
        msg: "No existe la peticion con el id " + id_request,
      });
    }
    if (request.status_request) {
      return res.status(400).json({
        ok: false,
        msg: "La petición ya esta completada.",
      });
    }
    const { id_payment } = request;
    const payment = await Payment.findByPk(id_payment);
    if (!payment.status_payment) {
      return res.status(400).json({
        ok: false,
        msg: `El pago del documento solicitado no se ha liquidado, liquedelo antes de continuar.`,
      });
    }
    await Request.update(
      { status_request: 1 },
      { where: { id_request: request.id_request } }
    );
    await Document.update(
      { creation_date: moment().format("YYYY-MM-DD").toString() },
      { where: { id_document: request.id_document } }
    );
    const { matricula, document_type } = request.document;
    res.redirect(
      307,
      `https://${
        process.env.NODE_ENV === "production"
          ? "api.alejandria.edu.mx"
          : "localhost"
      }/api-ale/v1/documents/${document_type}/students/${matricula}`
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Hable con el administrador",
    });
  }
};

const deleteRequest = async (req, res) => {
  const { id_request } = req.params;

  try {
    const request = await Request.findByPk(id_request);
    if (!request) {
      return res.status(400).json({
        ok: false,
        msg: "No existe la peticion con el id " + id,
      });
    }
    const { id_document, id_payment } = request;
    await request.destroy();
    const document = await Document.findByPk(id_document);
    await document.destroy();
    const stu_pay = await Stu_pay.findOne({
      where: { id_payment },
    });
    await stu_pay.destroy();
    const payment = await Payment.findByPk(id_payment);
    await Emp_par_pay.destroy({
      where: {
        id_partial_pay: {
          [Op.in]: literal(
            `(SELECT id_partial_pay FROM partial_pays WHERE id_payment = ${id_payment})`
          ),
        },
      },
    });
    await Partial_pay.destroy({ where: { id_payment } });
    await payment.destroy();

    res.status(200).json({
      ok: true,
      msg: "La peticion se elimino correctamente",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Hable con el administrador",
    });
  }
};

const getRequestsFromStudent = async (req, res) => {
  const { matricula } = req.params;
  try {
    const requestsStudent = await getRequests({ matricula });
    return res.json({
      ok: true,
      requests: requestsStudent,
    });
  } catch (error) {
    printAndSendError(res, error);
  }
};

module.exports = {
  createRequest,
  getAllTheRequests,
  completeARequest,
  deleteRequest,
  getRequestsFromStudent,
};
