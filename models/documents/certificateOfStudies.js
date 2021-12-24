const { AlePDFDocument } = require("../alePDFDocument");
const conversor = require('numero-palabra');
class CertficateOfStudies extends AlePDFDocument{
    constructor(student = {}){
        super(student);
        this.writeHeader();
        this.fillDocument();
        this.endDocument();
    }

    writeHeader(){
        this.PDFInstance
        .image('types/icon.jpg',this.PDFInstance.x-(this.marginXDocument*.5),this.PDFInstance.y,{fit:[100,100]})
        .fontSize(16)
        .font('regular-bold')
        .text(`${this.schoolName}`,this.marginXDocument*.5+110,this.marginYDocument,{align:'center'})
        .fontSize(10)
        .font('regular')
        .text(`Incorporado al Sistema Estatal de Educación, con Reconocimiento de Validez Oficial de Estudios otorgado por la Secretaría de Educación del Estado de Durango, según Acuerdo Número 293 de fecha 04 de octubre de 2004 Clave: ${this.schoolKey}`,{align:'justify',})
        .moveDown(2)
        .text('Certificado No. ',{align:'right'})
    }

    fillDocument(){
        let posYBody
        this.PDFInstance.moveDown(2);
        posYBody = this.PDFInstance.y
        this.PDFInstance.
        ellipse(this.marginXDocument / 2 + 87 ,posYBody+50,37,50).stroke()
        .text(`La Jefatura de Servicios Escolares del Instituto de Educación y Cultura Alejandría CERTIFICA, que de acuerdo con el expediente número ${this.student.matricula}, ${this.student.gendre == 'F' ? 'la alumna' : 'el alumno'}`,this.PDFInstance.x+30,posYBody,{align:'justify'})
        .moveDown()
        .font('regular-bold')
        .text(`${this.student.student_name}`,{align:'center'})
        .moveDown()
        .font('regular')
        .text(`cursó  y acreditó las asignaturas que a continuación se indican y que cubren ÍNTEGRAMENTE el Plan de Estudios  009 correspondiente a la`,{align:'justify'})
        .moveDown()
        .font('regular-bold')
        .text(`${this.student.major_name}`,{align:'center'})
        .moveDown()
        .font('regular')
        .text('impartido por esta Institución, con los promedios finales que se anotan.',{align:'justify'})
        this.PDFInstance.x = this.marginXDocument
        this.PDFInstance.moveDown()
        this.drawKardexTable(true)
        this.setTableButtomBorder(this.student.grades.length)
        this.tableDocument.addBody(this.student.grades.map(({key,credits,grade:gradeNum,course:courseName})=>({key,credits,gradeNum,courseName})));
        this.PDFInstance.x = this.marginXDocument
        this.PDFInstance
        .moveDown()
        .fontSize(10)
        .text(`Para los fines legales se extiende el presente `,{continued:true})
        .font('regular-bold')
        .text(`Certificado de Estudios`,{continued:true})
        .font('regular')
        .text(` que ampara ${this.student.grades.length} asignaturas de un total de 36 asignaturas, con Promedio General de ${this.student.generalAvg} (${this.getLetterFromGrade(Number(this.student.generalAvg).toString())}) y ${this.student.grades.reduce((cur,prev)=>cur.credits + prev.credits)} créditos cubiertos, en la ciudad de Victoria de Durango, Dgo., a los ${this.dateDay} días del mes de ${this.dateMonth} de ${this.dateYear}`)
        .moveDown(2)
        .text('La escala de calificaciones es de 5 a 10, la mínima aprobatoria es de 7.')
        .text('Este documento no es válido si presenta raspaduras o enmendaduras.')
        .moveDown(5)
        let posYSigns = this.PDFInstance.y
        this.drawLineToSign(this.PDFInstance.x+20,posYSigns,this.pageWidthWithMargin / 2 - 20*2,{txtButtom:`${this.principalName}~Directora`,alignTxtButtom:'center',fontsSizeTxtButton:[8,10]})
        this.drawLineToSign(this.marginXDocument + 20 + this.pageWidthWithMargin / 2,posYSigns,this.pageWidthWithMargin / 2 - 20*2,{txtButtom:`${this.susbribePerson}~${this.workStation}`,alignTxtButtom:'center',fontsSizeTxtButton:[8,10]})
        this.PDFInstance
        .addPage()
        .text('El presente Certificado se resella por la suscrita Coordinadora de Educación Media Superior, Superior y Particular de la Secretaría de Educación del Estado de Durango, en cumplimiento a lo dispuesto por los Artículos 8, 17, 18 y 54 del Reglamento para la Educación que imparten los Particulares, en la ciudad de Victoria de Durango, Dgo.',{align:'justify'})
        .moveDown(2)
        .text('Fecha: _______________')
        .moveDown()
        .text('Folio: _______________')
        .font('regular-bold')
        .text('Sello',this.PDFInstance.options.size[0]-this.marginXDocument-80,this.PDFInstance.y)
        .moveDown(5)
        .font('regular')
        this.drawLineToSign(this.marginXDocument+120,this.PDFInstance.y,this.pageWidthWithMargin - 120*2,{txtButtom:'PROFRA. MARÍA CRISTINA SOTO SOTO~COORDINADORA',alignTxtButtom:'center',fontsSizeTxtButton:[ 10 ]})
    }

    getLetterFromGrade(grade = ''){
        let partsOfGrade = grade.split('.')
        return `${conversor(partsOfGrade[0])} punto ${conversor(partsOfGrade[1])}`
    }
}

module.exports = CertficateOfStudies;
