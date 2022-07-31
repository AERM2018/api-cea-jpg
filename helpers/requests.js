const moment = require("moment");
const { fn, col } = require("sequelize");
const Document = require("../models/document");
const Partial_pay = require("../models/partial_pay");
const Payment = require("../models/payment");
const Request = require("../models/request");
const Student = require("../models/student");
const Stu_pay = require("../models/stu_pay");
const { document_types } = require("../types/dictionaries");

const getRequests = async (opts = { matricula: "", status: 0, date: "" }) => {
  const { matricula, status = "all", date = "all" } = opts;
  let requests;

  let condition = {};
  if (date != "all") condition.creation_date = date;
  if (status != "all") condition.status_request = status;

  Request.belongsTo(Payment, { foreignKey: "id_payment" });
  Payment.hasOne(Request, { foreignKey: "id_payment" });

  Request.belongsTo(Document, { foreignKey: "id_document" });
  Document.hasOne(Request, { foreignKey: "id_document" });

  Stu_pay.belongsTo(Payment, { foreignKey: "id_payment" });
  Payment.hasOne(Stu_pay, { foreignKey: "id_payment" });

  Stu_pay.belongsTo(Student, { foreignKey: "id_student" });
  Student.hasMany(Stu_pay, { foreignKey: "id_student" });

  requests = await Request.findAll({
    include: [
      {
        model: Payment,
        required: true,
        include: {
          model: Stu_pay,
          required: true,
          include: {
            model: Student,
            required: true,
            attributes: [
              [
                fn(
                  "concat",
                  col("surname_m"),
                  " ",
                  col("surname_f"),
                  " ",
                  col("name"),
                ),
                "student_name",
              ],
              "matricula",
              "id_student",
            ],
          },
        },
      },
      {
        model: Document,
        attributes: ["document_type"],
      },
    ],
    where: condition,
    attributes: {
      exclude: ["id_document", "id_payment", "id_department"],
    },
  });
  if (requests.length < 1) return [];
  const sanitazedRequests = [];
  for (const request of requests) {
    const {
      payment,
      document,
      status_request: old_status_request,
      ...restoRequest
    } = request.toJSON();
    let { status_request } = request.toJSON();
    status_request = payment.status_payment ? "Pagado" : undefined;
    if (!status_request) {
      const [{ accumulate }] = await Partial_pay.findAll({
        where: { id_payment: payment.id_payment },
        attributes: [[fn("sum", col("amount_p")), "accumulate"]],
        group: ["id_payment"],
        nest: true,
        raw: true,
      });
      status_request =
        accumulate === 0
          ? "No pagado"
          : `Adeudo: $${parseFloat(payment.amount - accumulate).toFixed(2)}`;
    }
    const student = payment.stu_pay.student;
    sanitazedRequests.push({
      ...restoRequest,
      status_request,
      creation_date: moment(restoRequest.creation_date).format("D,MMMM,YYYY"),
      ...student,
      document_type: document.document_type,
      document_name: document_types.find(
        (documentType) => documentType.id === document.document_type
      ).name,
    });
  }
  return sanitazedRequests;
};

module.exports = {
  getRequests,
};
