const {AlePDFDocument} = require("../alePDFDocument");


class InternshipLetter extends AlePDFDocument{
    constructor(){
        super()
        this.fillDocument()
    }

    writeHeader(){
        this.PDFInstance
        .image("types/icon.jpg",this.PDFInstance.x,this.PDFInstance.y,{fit:[100,100],align:"left"})
        .text("Instituto de Educación y Cultura Alejandría S. C.",this.marginXDocument+120,this.marginYDocument,{align:"center"})
        .moveDown()
        this.PDFInstance.fontSize(8)
        .text(`Incorporado al Sistema Estatal de Educación, con Reconocimiento de Validez Oficial de Estudios otorgado por la Secretaría de Educación del Estado de Durango, según Acuerdo Número 293 de fecha 04 de Octubre de 2004 Clave: ${this.schoolKey}`,{align:"left"})
        .moveDown(5)
    }

    fillDocument(){
        this.writeHeader()
        this.PDFInstance
        .moveDown(3)
        .fontSize(24).font('Times-Bold')
        .text("C A R T A  D E  P A S A N T E",this.marginXDocument,this.PDFInstance.y,{align:"center"})
        .moveDown(2)
        .fontSize(18)
        .text("A: xxxxxxxxxxxxxxxxxxxxx",{align:"center"})
        .moveDown(2)
        .text("Curso y aprobó las asignaturas correspondientes al Plan de Estudios de la xxxxxxxxxxxx.")
        .moveDown(2)
        .text(`Comprobada su escolaridad, mediante previa y rigurosa revisión curricular y con fundamento en los Artículos 16, 153 y 163 párrafo II de la ley de Educación del Estado de Durango, se extiende la presente en Durango, Dgo., a los veinticinco días del mes de ${this.dateDay} del año dos mil veintiuno`)
        .moveDown(5)
        .fontSize(13)
        .text(`${this.principalName}`,{align:"center"})
        .text("Directora",{align:"center"})
        this.endDocument()
    }
}

module.exports = InternshipLetter;


