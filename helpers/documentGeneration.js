const InternshipLetter = require('../models/documents/internshipLetter');
const Title = require('../models/documents/title');
const AlePDFDocument = require('../models/alePDFDocument');
const ServiceLetter = require('../models/documents/serviceLetter');
const ProofOfStudies = require('../models/documents/proofOfStudies');
const ProofOfTitleInProg = require('../models/documents/proofOfTitleInProg');
const Kardex = require('../models/documents/kardex');
const CertficateOfStudies = require('../models/documents/certificateOfStudies');

const generateNewDoc = (dataCallback, endCallback) => {
    let aleDocument
    let documentType = 5
    switch (documentType) {
        case 0:
            aleDocument = new ProofOfStudies(false);
            break;
        case 1:
            aleDocument = new ProofOfStudies(true);
            break;
        case 2:
            aleDocument = new ServiceLetter('practicas');
            break;
        case 3:
            aleDocument = new ServiceLetter('servicio');
            break;
        case 4:
            aleDocument = new InternshipLetter(); //Carta pasante
            break;
        case 5:
            aleDocument = new Title();
            break;
        case 6:
            aleDocument = new ProofOfTitleInProg();
            break;
        case 7:
            aleDocument = new Kardex();
            break;
        case 8:
            aleDocument = new CertficateOfStudies();
            break;
            
        default:
            break;
    }
    aleDocument.PDFInstance.on('data',dataCallback);
    aleDocument.PDFInstance.on('end',endCallback);
}

module.exports = {
    generateNewDoc,
};
