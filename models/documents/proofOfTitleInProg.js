const { AlePDFDocument } = require("../alePDFDocument");

class ProofOfTitleInProg extends AlePDFDocument{
    constructor(student){
        super(student);
        this.writeHeader();
        this.fillDocument();
        this.writeFooter();
        this.endDocument();
    }

    fillDocument(){
        this.PDFInstance
        .font('regular-bold')
        .fontSize(10)
        .text('Asunto: Constancia de titulo en progreso.',{align:'right'})
        .fontSize(12)
        .text('A quien corresponda',{align:'left'})
        .text('P R E S E N T E.-',{align:'left'})
        .moveDown(2)
        .font('regular')
        .text(`        Por medio de la presente hago constar que  ${this.student.gendre == 'F' ? 'la ' : 'el '}`,{continued:true})
        .font('regular-bold')
        .text(`C. ${this.student.student_name} `,{continued:true})
        .font('regular')
        .text(`es egresad${this.student.gendre == 'F' ? 'a' : 'o'} de la `,{continued:true})
        .font('regular-bold')
        .text(`${this.student.major_name} `,{continued:true})
        .font('regular')
        .text('en esta institución.')
        .moveDown(2)
        .text(`Se extiende la presente a solicitud del interesado para los fines legales que a esta convengan en la ciudad de Victoria de Durango, Durango a los ${this.dateDay} días del mes de ${this.dateMonth} de ${this.dateYear}`)
        .moveDown(6)



    }
}

module.exports = ProofOfTitleInProg
