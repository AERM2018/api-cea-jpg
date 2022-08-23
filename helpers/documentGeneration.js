// const InternshipLetter = require("../models/documents/internshipLetter");
// const Title = require("../models/documents/title");
// const AlePDFDocument = require("../models/alePDFDocument");
// const ProofOfTitleInProg = require("../models/documents/proofOfTitleInProg");
// const CertficateOfStudies = require("../models/documents/certificateOfStudies");
const ServiceLetter = require("../models/documents/serviceLetter");
const ProofOfStudies = require("../models/documents/proofOfStudies");
const Kardex = require("../models/documents/kardex");
const TestRecord = require("../models/documents/testRecord");
const ProofOfStudiesSegmented = require("../models/documents/proofOfStudiesSegmented");
const ExpensesReport = require("../models/documents/expensesReport");

const generateNewDoc = (tools, document_type, dataCallback, endCallback) => {
  let aleDocument;
  switch (document_type) {
    case 0:
      aleDocument = new ProofOfStudies(tools.student, false);
      break;
    case 1:
      aleDocument = new ProofOfStudies(tools.student, true);
      break;
    case 2:
      aleDocument = new ProofOfStudiesSegmented(tools.student,4);
      break;
    case 3:
      aleDocument = new ServiceLetter(tools.student, "practicas");
      break;
    case 4:
      aleDocument = new ServiceLetter(tools.student, "servicio");
      break;
    case 10:
      aleDocument = new Kardex(tools.student);
      break;
    case 11:
      aleDocument = new TestRecord(tools.tests);
      break;
    default:
      aleDocument.PDFInstance.on("end", endCallback);
      throw Error("Unexpected behavior at document generation.");
      break;
  }
  aleDocument.PDFInstance.on("data", dataCallback);
  aleDocument.PDFInstance.on("end", endCallback);
};

const generateExpensesDoc = (expenses,dateRange,dataCallback,endCallback) => {
  const aleDocument = new ExpensesReport(expenses, dateRange);
  aleDocument.PDFInstance.on("data", dataCallback);
  aleDocument.PDFInstance.on("end", endCallback);
}
module.exports = {
  generateNewDoc,
  generateExpensesDoc,
};
