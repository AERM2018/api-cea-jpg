const { getGradesStudent } = require("../../helpers/students");
const { document_types } = require("../../types/dictionaries");
const { AlePDFDocument } = require("../alePDFDocument");

class ProofOfStudies extends AlePDFDocument{
    constructor( student = {},hasGrades = false){
        super(student);
        this.hasGrades = hasGrades;
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
        .text(`Asunto: ${document_types[0].name}`,{align:"right"})
        .moveDown(2)
        .text("A quien corresponda:",)
        .moveDown(2)
        .font('regular')
        .text(`${this.peopleToSign[2].article} que suscribe `,{continued:true,align:'justify'})
        .font('regular-bold')
        .text(`${this.peopleToSign[2].name} `,{continued:true})
        .font('regular')
        .text(`${this.peopleToSign[2].workstation} del ${this.schoolShortName}, clave `,{continued:true})
        .font('regular-bold')
        .text(`${this.schoolKey} `,{continued:true})
        .font('regular')
        .text(`hace constar que ${this.student.gendre == 'F' ? 'la' : 'el'} C. `,{continued:true})
        .font('regular-bold')
        .text(`${this.student.student_name} `,{continued:true})
        .font('regular')
        .text("con número de matricula: ",{continued:true})
        .font('regular-bold')
        .text(`${this.student.matricula} `,{continued:true})
        .font('regular')
        .text(`es ${this.student.gendre == 'F' ? 'alumna' : 'alumno'} y está ${this.student.gendre == 'F' ? 'inscrita' : 'inscrito'} en la `,{continued:true})
        .font('regular-bold')
        .text(`${this.student.major_name} `,{continued:true})
        .font('regular')
        .text("en esta Institución.",{continued:this.hasGrades})
        if( this.hasGrades ) this.addGrades()
    }

    addGrades(){
        // let pageWidthWithMargin = this.PDFInstance.options.size[0] - (this.PDFInstance.x * 2)
        let tableHeaders = [
            {id : "courseName",header : "Materia",width : .5},
            {id : "grade",header : "Calificación",width : .5}
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
        this.tableDocument.addBody(this.student.grades.map(({grade,course:courseName})=>({grade,courseName})))
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
