const Stu_pay = require("../models/stu_pay");
const Req_pay = require("../models/req_pay");
const { QueryTypes, where, fn, col } = require("sequelize");
const { getStuInfo, getGradesByStudent } = require("../queries/queries");
const { db } = require("../database/connection");
const Request = require("../models/request");
const { document_types } = require("../types/dictionaries");
const { printAndSendError } = require("../helpers/responsesOfReq");
const {
  getGradesStudent,
  getCourseStudentIsTaking,
  getStudentInfo,
  getExtraCoursesGradesStudent,
} = require("../helpers/students");
const Document = require("../models/document");
const Student = require("../models/student");
const moment = require("moment");
const { generateNewDoc } = require("../helpers/documentGeneration");
const { response } = require("express");
const Stu_info = require("../models/stu_info");
const getTestInfo = require("../helpers/tests");
const getDocsTypesAvailableToStudent = async (req, res) => {
  const { id_student } = req;
  try {
    const { educational_level } = await Stu_info.findOne({
      where: { id_student },
      attributes: { exclude: ["id"] },
      raw: true,
    });
    const documents = [
      ...document_types.filter(
        ({ name }) =>
          (!name.toLowerCase().includes("certificado de") &&
            !name.toLowerCase().includes("titulo de")) ||
          name
            .toLowerCase()
            .includes(`certificado de ${educational_level.toLowerCase()}`) ||
          name
            .toLowerCase()
            .includes(`titulo de ${educational_level.toLowerCase()}`)
      ),
    ];
    return res.status(200).json({
      ok: true,
      document_types: documents,
    });
  } catch (error) {
    printAndSendError(res, error);
  }
};

const createDocument = async (req, res = response) => {
  let { document_type, matricula } = req.params;
  const { person_name, person_workstation } = req.body;
  const { id_group, id_course } = req.body;
  try {
    document_type = parseInt(document_type);
    let toolsForMakingDoc = {};
    if (document_types.map((type) => type.id).includes(document_type)) {
      if (![11].includes(document_type)) {
        toolsForMakingDoc.student = await getStudentInfo(matricula);
        if ([0, 1, 2,3, 10].includes(document_type)) {
          let { grades, generalAvg = 0 } =
            (await getGradesStudent(toolsForMakingDoc.student.id_student, {
              withAvg: true,
              forKardex: true,
            })) || [];
            let extraGrades = await getExtraCoursesGradesStudent(
              toolsForMakingDoc.student.id_student
            );
          grades = grades.filter(
            ({ grade }) => grade !== "NP" && grade !== "-"
          );
          extraGrades = extraGrades.filter( extra => extra.grade != 0)
          if ([1, 2, 3,10].includes(document_type) && grades.length === 0)
            return res.status(400).json({
              ok: false,
              msg: `No se ha podido generar un documento con id ${document_type} debido a que el estudiante con matricula ${matricula} no tiene calificiaciones cargadas.`,
            });
          toolsForMakingDoc.student.grades = grades;
          toolsForMakingDoc.student.extraGrades = extraGrades
          toolsForMakingDoc.student.generalAvg = generalAvg;
        }
        if ([4, 5].includes(document_type)) {
          toolsForMakingDoc.student.worksFor = {
            person_name,
            person_workstation,
          };
        }
      } else {
        toolsForMakingDoc.tests = await getTestInfo(true, {
          id_group,
          id_course,
        });
        if (toolsForMakingDoc.tests == null)
          return res.status(404).json({
            ok: false,
            msg: "No existen exámenes asignados para generar la acta de exámen.",
          });
      }
    } else {
      return res.status(400).json({
        ok: false,
        msg: `No se ha podido generar un documento con id ${document_type} debido a que no se encuentra registrado en el sistema.`,
      });
    }
    const stream = res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
    });
    generateNewDoc(
      toolsForMakingDoc,
      document_type,
      (chunk) => {
        stream.write(chunk);
      },
      () => stream.end()
    );
  } catch (error) {
    console.log(error);
    return printAndSendError(res, error);
  }
};

const getDocuments = async (req, res) => {
  Document.belongsTo(Student, { foreignKey: "id_student" });
  Student.hasMany(Document, { foreignKey: "id_student" });

  Request.belongsTo(Document, { foreignKey: "id_document" });
  Document.hasOne(Request, { foreignKey: "id_document" });

  let documents = await Document.findAll({
    include: [
      {
        model: Student,
        attributes: [
          "id_student",
          "matricula",
          [
            fn(
              "concat",
              col("surname_m"),
              " ",
              col("surname_f"),
              " ",
              col("name")
            ),
            "student_name",
          ],
        ],
      },
      {
        model: Request,
      },
    ],
  });

  documents = documents.map((doc) => {
    const { student, request, ...restoDoc } = doc.toJSON();
    let docToReturn = {
      ...restoDoc,
      document_name: document_types[restoDoc.document_type]["name"],
      ...student,
    };
    docToReturn = request
      ? { ...docToReturn, belongsToARequest: true }
      : { ...docToReturn, belongsToARequest: false };
    return docToReturn;
  });
  res.json({
    ok: true,
    documents,
  });
};

const deleteDocument = async (req, res) => {
  const { id_document } = req.params;

  Request.belongsTo(Document, { foreignKey: "id_document" });
  Document.hasOne(Request, { foreignKey: "id_document" });
  const document = await Document.findByPk(id_document, {
    include: {
      model: Request,
    },
  });

  if (document.request) {
    return res.status(400).json({
      ok: false,
      msg: `El documento con id ${id_document} no pudo ser eliminado debido a que esta asociado con una petición.`,
    });
  }
  await document.destroy();

  return res.json({
    ok: true,
    msg: "El documento fue eliminado correctamente.",
  });
};
module.exports = {
  getDocsTypesAvailableToStudent,
  createDocument,
  getDocuments,
  deleteDocument,
};
