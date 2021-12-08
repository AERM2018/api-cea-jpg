const VoilabPdfTable = require("voilab-pdf-table");
const { AlePDFDocument } = require("../alePDFDocument");

class Kardex extends AlePDFDocument {
  constructor() {
    super();
    this.writeHeader2();
    this.fillDocument();
    this.endDocument();
  }

  fillDocument() {
    this.PDFInstance.font("Helvetica-Bold")
      .fontSize(18)
      .moveDown(2)
      .text(`Cárdex del Alumna`, { align: "center" }) // Saber genero para determinar si es alumno o alumna
      .font("Helvetica")
      .fontSize(12)
      .text(`Nombre de la alumna: `, this.marginXDocument, this.PDFInstance.y) // Saber genero del alumno
      .font("Helvetica-Bold")
      .text(`xxxxxxxxxxxxxxxxxxxxxx`)
      .font("Helvetica")
      .text(`Carrera: `)
      .font("Helvetica-Bold")
      .text(`xxxxxxxxxxxxxxxxxxxxxx`)
      .font("Helvetica")
      .text(`Matrícula: `)
      .font("Helvetica-Bold")
      .text(`xxxxxxxxxxxxxxxxxxxxxx`)
      .fontSize(8);
    let tableHeaders = [
      {id: "Clave",header: "Clave",width: 0.1,},
      {id: "Asignatura",header: "Asignatura",width: 0.25,},
      {id: "Creditos",header: "Creditos",width: 0.1,},
      {id: "Calificaciones",header: "Calificaciones",width: 0.25},
      {id: "Fecha de examen",header: "Fecha de examen",width: 0.15,},
      {id: "Tipo de examen",header: "Tipo de examen",width: 0.15,},
    ];
    tableHeaders = tableHeaders.map((h) => ({
      ...h,
      width: this.pageWidthWithMargin * h.width,
    }));
    this.createTable(tableHeaders, ["T", "L", "R"], ["L", "R"]);
    this.tableDocument.addBody([]);
    this.PDFInstance.x = this.marginXDocument;
    let tableSubHeaders = [
      {id: "key",width: 0.1,},
      {id: "subject",width: 0.25,},
      {id: "credits",width: 0.1,},
      {id: "gradesNum",header: "No.",width: 0.125,headerBorder: ["B", "T", "L", "R"],},
      {id: "gradesLetter",header: "Letra",width: 0.125,headerBorder: ["B", "T", "L", "R"],},
      {id: "dateTest",width: 0.15,},
      {id: "typeTest",width: 0.15,},
    ];
    tableSubHeaders = tableSubHeaders.map((h) => ({
      ...h,
      width: this.pageWidthWithMargin * h.width,
    }));
    this.createTable(tableSubHeaders, ["B", "L", "R"], ["B", "L", "R","T"]);
    let array = [];
    for (let i = 0; i < 36; i++) {
      array.push({
        key: "SDA",
        subject: "SDA",
        credits: "SDA",
        gradesNum: `${i}`,
        gradesLetter: "SDA",
        dateTest: "SDA",
        typeTest: "SDA",
      });
    }
    this.tableDocument.addBody(array);
    this.PDFInstance.x = this.marginXDocument
    this.PDFInstance
    .moveDown()
    .text(`Este cárdex ampara 36 asignaturas, con promedio general de 9.5 y 426 créditos cubiertos.`)
    .moveDown(8)
    this.drawLineToSign(this.pageWidthWithMargin / 2 + this.marginXDocument - 75, this.PDFInstance.y,150,'Ernesto Pruneda Mar~Jefe de Servicios Escolares','center')
  }
}

module.exports = Kardex;
