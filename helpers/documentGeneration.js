const InternshipLetter = require("../models/documents/internshipLetter");
const Title = require("../models/documents/title");
const AlePDFDocument = require("../models/alePDFDocument");
const ServiceLetter = require("../models/documents/serviceLetter");
const ProofOfStudies = require("../models/documents/proofOfStudies");
const ProofOfTitleInProg = require("../models/documents/proofOfTitleInProg");
const Kardex = require("../models/documents/kardex");
const CertficateOfStudies = require("../models/documents/certificateOfStudies");
const TestRecord = require("../models/documents/testRecord");

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
      aleDocument = new ServiceLetter(tools.student, "practicas");
      break;
    case 3:
      aleDocument = new ServiceLetter(tools.student, "servicio");
      break;
    case 4:
      aleDocument = new CertficateOfStudies(tools.student);
      break;
    case 5:
      aleDocument = new Title(tools.student);
      break;
    case 6:
      aleDocument = new InternshipLetter(tools.student); //Carta pasante
      break;
    case 7:
      aleDocument = new Kardex(tools.student);
      break;
    case 8:
      aleDocument = new ProofOfTitleInProg(tools.student);
      break;
    case 9:
      aleDocument = new TestRecord(tools.tests);
      break;
    default:
      return
      break;
  }
  aleDocument.PDFInstance.on("data", dataCallback);
  aleDocument.PDFInstance.on("end", endCallback);
};

module.exports = {
  generateNewDoc,
};
