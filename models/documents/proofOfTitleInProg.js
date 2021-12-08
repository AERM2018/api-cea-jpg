const { AlePDFDocument } = require("../alePDFDocument");

class ProofOfTitleInProg extends AlePDFDocument{
    constructor(){
        super();
        this.writeHeader();
        this.fillDocument();
        this.writeFooter();
        this.endDocument();
    }

    fillDocument(){
        this.PDFInstance
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('Asunto: xxxxxxxxxxxx',{align:'right'})
        .fontSize(12)
        .text('A quien corresponda',{align:'left'})
        .text('P R E S E N T E.-',{align:'left'})
        .moveDown(2)
        .font('Helvetica')
        .text('        Por medio de la presente hago constar que el ',{continued:true})
        .font('Helvetica-Bold')
        .text('C. xxxxxxxxxxxxx ',{continued:true})
        .font('Helvetica')
        .text('es egresado de la ',{continued:true})
        .font('Helvetica-Bold')
        .text('xxxxxxxxxxxxx ',{continued:true})
        .font('Helvetica')
        .text('en esta institución.')
        .moveDown(2)
        .text(`Se extiende la presente a solicitud del interesado para los fines legales que a esta convengan en la ciudad de Victoria de Durango, Durango a los ${this.dateDay} días del mes de ${this.dateMonth} de ${this.dateYear}`)
        .moveDown(6)



    }
}

module.exports = ProofOfTitleInProg
