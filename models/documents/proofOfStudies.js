const { document_types } = require("../../types/dictionaries");
const { AlePDFDocument } = require("../alePDFDocument");

class ProofOfStudies extends AlePDFDocument{
    constructor( hasGrades = false){
        super();
        this.hasGrades = hasGrades;
        this.fillDocument();
    }

    fillDocument(){
        super.writeHeader()
        this.PDFInstance
        .font('Helvetica-Bold')
        .fontSize(12)
        .text(`Asunto: ${document_types[0].name}`,{align:"right"})
        .moveDown(2)
        .text("A quien corresponda:",)
        .moveDown(2)
        .font('Helvetica')
        .text("El que suscribe ",{continued:true,align:'justify'})
        .font('Helvetica-Bold')
        .text(`${this.susbribePerson} `,{continued:true})
        .font('Helvetica')
        .text(`${this.workStation} del ${this.schoolShortName}, clave `,{continued:true})
        .font('Helvetica-Bold')
        .text(`${this.schoolKey} `,{continued:true})
        .font('Helvetica')
        .text("hace constar que el C. ",{continued:true})
        .font('Helvetica-Bold')
        .text("xxxxxxxxxxxxxxxxxxxx ",{continued:true})
        .font('Helvetica')
        .text("con número de matricula: ",{continued:true})
        .font('Helvetica-Bold')
        .text("xxxxxxxxxxxx ",{continued:true})
        .font('Helvetica')
        .text("es alumno y está inscrito en la ",{continued:true})
        .font('Helvetica-Bold')
        .text("xxxxxxxxxxxx ",{continued:true})
        .font('Helvetica')
        .text("en esta Institución.",{continued:this.hasGrades})
        if( this.hasGrades ){
            this.addGrades()
        }
        this.writeExpeditionDate()
        this.writeFooter()
        super.endDocument();
    }

    addGrades(){
        // let pageWidthWithMargin = this.PDFInstance.options.size[0] - (this.PDFInstance.x * 2)
        let tableHeaders = [{
                id : "courseName",
                header : "Materia",
                width : .5
            },
            {
                id : "grade",
                header : "Calificación",
                width : .5
            }
        ]
        tableHeaders = tableHeaders.map( h => ({...h,width : this.pageWidthWithMargin*h.width}))
        this.createTable(tableHeaders,{
            headerBorder:['T','R','B','L'],
            cellBorder: ['T','R','B','L'],
            headerPadding:[5,5,5,5],
            padding:[5,5,5,5]
        })
        this.PDFInstance
        .text("Y ha cursado las siguientes materias: ")
        this.PDFInstance.moveDown()
        this.tableDocument.addBody([{
            courseName : "xxxxxxxxxxxx",
            grade : 10
        },{
            courseName : "xxxxxxxxxxxx",
            grade : 10
        },])
        
    }

    writeExpeditionDate(){
        this.PDFInstance
            .text("",this.marginDocument,this.PDFInstance.y)
            .moveDown(2)
            .text(`Se extiende la presente a solicitud del interesado en la ciudad de Durango, Dgo., a los ${this.dateDay} días del mes de ${this.dateMonth} de ${this.dateYear}. `,this.marginXDocument,this.PDFInstance.y,{align:"left"})
            .moveDown(5)
    }
}

module.exports = ProofOfStudies;
