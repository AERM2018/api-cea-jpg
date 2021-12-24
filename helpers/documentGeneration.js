const InternshipLetter = require("../models/documents/internshipLetter");
const Title = require("../models/documents/title");
const AlePDFDocument = require("../models/alePDFDocument");
const ServiceLetter = require("../models/documents/serviceLetter");
const ProofOfStudies = require("../models/documents/proofOfStudies");
const ProofOfTitleInProg = require("../models/documents/proofOfTitleInProg");
const Kardex = require("../models/documents/kardex");
const CertficateOfStudies = require("../models/documents/certificateOfStudies");

const generateNewDoc = (student, document_type, dataCallback, endCallback) => {
  let aleDocument;
  switch (document_type) {
    case 0:
      aleDocument = new ProofOfStudies(student, false);
      break;
    case 1:
      aleDocument = new ProofOfStudies(student, true);
      break;
    case 2:
      aleDocument = new ServiceLetter(student, "practicas");
      break;
    case 3:
      aleDocument = new ServiceLetter(student, "servicio");
      break;
    case 4:
      aleDocument = new CertficateOfStudies(student);
      break;
    case 5:
      aleDocument = new Title(student);
      break;
    case 6:
      aleDocument = new InternshipLetter(student); //Carta pasante
      break;
    case 7:
      aleDocument = new Kardex(student);
      break;
    case 8:
      aleDocument = new ProofOfTitleInProg(student);
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
