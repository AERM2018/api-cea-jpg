const AlePDFDocument = require('../types/documentTypesFormat');

const generateNewDoc = (dataCallback, endCallback) => {
    const aleDocument = new AlePDFDocument(3);
    aleDocument.PDFInstance.on('data',dataCallback);
    aleDocument.PDFInstance.on('end',endCallback);
    aleDocument.createDoc()
}

module.exports = {
    generateNewDoc
};
