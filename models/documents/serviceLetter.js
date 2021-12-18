const { AlePDFDocument } = require("../alePDFDocument");

class ServiceLetter extends AlePDFDocument{
    constructor(student = {},type){
        super(student);
        this.type = type;
        this.fillDocument();
        this.writeExpeditionDate()
        this.writeFooter()
        super.endDocument();
    }

    fillDocument(){
        super.writeHeader()
        this.PDFInstance
        .font('regular-bold')
        .fontSize(12)
        .text(`${this.student.worksFor.personName}`,{align:"justify"})
        .text(`${this.student.worksFor.personWorkStation}`,)
        .text("P R E S E N T E.-")
        .moveDown(3)
        .font('regular')
        .text(`De la manera más atenta me dirijo a usted para solicitar se le permita realizar ${(this.type == 'practicas')?'sus':'su'} `,{continued:true,align:'justify'})
        .font('regular-bold')
        .text(`${(this.type == 'practicas')?'prácticas profesionales':'servicio social'} `,{continued:true})
        .font('regular')
        .text("en esa institución a su digno cargo a al C.",{continued:true})
        .font('regular-bold')
        .text(`${this.student.student_name} `,{continued:true})
        .font('regular')
        .text(`es alumna de este instituto que ha sido aprobada para hacer ${(this.type == 'practicas')?'sus':'su'} `,{continued:true})
        .font('regular-bold')
        .text(`${(this.type == 'practicas')?'prácticas profesionales':'servicio social'} `,{continued:false})
        .moveDown()
        .font('regular')
        .text(`Para su liberación debe cubrir un total de ${(this.type == 'practicas')?'240':'120'} horas de trabajo efectivo en un periodo de cuatro meses, firmados y sellados por la dependencia en los cuáles deberá de especificar (fechas de inicio y término de las mismas), y área o departamento en el que se desempeña y actividades que realiza, propias de la carrera.`,{})
        .moveDown(2)
        .text('Agradeciendo de antemano y sin otro asunto por el momento le envió un saludo.')
    }

    writeExpeditionDate(){
        this.PDFInstance
            .text("",this.marginDocument,this.PDFInstance.y)
            .moveDown(2)
            .text(` Durango, Dgo., a de ${this.dateDay} de ${this.dateMonth} de ${this.dateYear}. `,this.marginXDocument,this.PDFInstance.y,{align:"center"})
            .moveDown(5)
    }
}

module.exports = ServiceLetter;
