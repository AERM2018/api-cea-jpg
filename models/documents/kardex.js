const VoilabPdfTable = require("voilab-pdf-table");
const { AlePDFDocument } = require("../alePDFDocument");

class Kardex extends AlePDFDocument {
  constructor(student = {}) {
    super(student);
    this.writeHeader2();
    this.fillDocument();
    this.endDocument();
    
  }

  fillDocument() {
    this.PDFInstance.font("regular-bold")
      .fontSize(18)
      .moveDown(2)
      .text(`Cárdex del ${this.student.gendre == 'F' ? 'Alumna' : 'Alumno'}`, { align: "center" }) // Saber genero para determinar si es alumno o alumna
      .font("regular")
      .fontSize(12)
      .text(`Nombre de ${this.student.gendre == 'F' ? 'la almuna' : 'el alumno'}: `, this.marginXDocument, this.PDFInstance.y) // Saber genero del alumno
      .font("regular-bold")
      .text(`${this.student.student_name}`)
      .font("regular")
      .text(`Carrera: `)
      .font("regular-bold")
      .text(`${this.student.major_name}`)
      .font("regular")
      .text(`Matrícula: `)
      .font("regular-bold")
      .text(`${this.student.matricula}`)
      .fontSize(8)
      .moveDown();
    this.drawKardexTable(false)
    this.setTableButtomBorder(this.student.grades.length)
    this.tableDocument.addBody(this.student.grades.map(({key,credits,grade:gradeNum,course:courseName,application_date : dateTest, test_type : typeTest})=>({key,credits,gradeNum,courseName,dateTest,typeTest})));
    this.PDFInstance.x = this.marginXDocument
    this.PDFInstance
    .moveDown()
    .text(`Este cárdex ampara ${this.student.grades.length} asignaturas, con promedio general de ${this.student.generalAvg} y ${this.student.grades.map(({credits}) => credits).reduce((cur,pre) => pre+cur)} créditos cubiertos.`)
    .moveDown(8)
    this.drawLineToSign(this.pageWidthWithMargin / 2 + this.marginXDocument - 75, this.PDFInstance.y,150,{
      txtButtom : 'Ernesto Pruneda Mar~Jefe de Servicios Escolares',
      alignTxtButtom : 'center',
      fontsSizeTxtButton : [10]
    })
  }
}

module.exports = Kardex;
