const PDFKit = require('pdfkit');
const PDFTable = require('voilab-pdf-table');
const moment = require('moment');
const { document_types } = require('./dictionaries');
const { moveDown } = require('pdfkit');
class AlePDFDocument{
    PDFInstance = PDFKit;
    documentType = 0;
    susbribePerson = "Ing. Ernesto Pruneda Mar"
    workStation = "Jefe de Servicios Escolares"
    principalName = "Mtra. Julieta Hernández Camargo"
    schoolName = "Instituto Alejandría"
    schoolKey = "10PSU0020G"
    dateYear = 0
    dateMonth = ""
    dateDay = 0
    marginDocument = 0;
    pageWidthWithMargin = 0
   
    
    constructor(documentType){
        this.PDFInstance = new PDFKit({size:[595.28,841.89]})
        this.marginXDocument = this.PDFInstance.x
        this.marginYDocument = this.PDFInstance.y
        this.pageWidthWithMargin = this.PDFInstance.options.size[0] - (this.marginDocument * 2)
        this.documentType = documentType
        this.formatDate()
    }

    formatDate(){
        const date = moment().format("YYYY-MMMM-DD")
        const [year,month,day] = date.split("-")
        this.dateYear = year
        this.dateMonth = month
        this.dateDay = day
    }

    createTable(headers=[]){
        this.tableDocument = new PDFTable(this.PDFInstance,{
            columnsDefaults : {
                headerBorder : ["B","T","L","R"],
                border : ["B","T","L","R"],
                headerPadding : [5,5,5,5],
                padding : [5,5,5,5]
            }
        })
        this.tableDocument.addColumns(headers)
    }

    createDoc(){
        switch (this.documentType) {
            case 0:
                this.fillAsProofOfStudies()
                break;
            case 1 : 
                this.fillAsProofOfStudies()
                this.addGradesToProofOfStudies()
                break
            case 2:
                this.fillAsMasterLetter()
                break;
            case 3:
                this.fillAsLetterOfIntership()
                break;
            default:
                break;
        }
        this.endDocument()
        // this.PDFInstance.end()
        return this.PDFInstance
    }

    writeNormalHeader(){
        this.PDFInstance
        .text("Instituto de Educación y Cultura Alejandría S. C.")
        .moveDown()
        .rect(this.PDFInstance.x,this.PDFInstance.y,(this.PDFInstance.options.size[0]-this.PDFInstance.x*2),0).stroke()
        .moveDown(0.5)
        .text("Ayuntamiento No. 618 Nte, Durango,Dgo.")
        .moveUp()
        .text("Tel (618) 8 11 75 06",{align:"right"})
        .moveDown(2)
    }

    writeLetterOfIntershipHeader(){
        this.PDFInstance.image("types/icon.jpg",this.PDFInstance.x,this.PDFInstance.y,{fit:[100,100],align:"left"})
        this.PDFInstance
        // .moveUp(100)
        .text("Instituto de Educación y Cultura Alejandría S. C.",this.marginXDocument+120,this.marginYDocument,{align:"center"})
        .moveDown()
        this.PDFInstance.fontSize(8)
        .text(`Incorporado al Sistema Estatal de Educación, con Reconocimiento de Validez Oficial de Estudios otorgado por la Secretaría de Educación del Estado de Durango, según Acuerdo Número 293 de fecha 04 de Octubre de 2004 Clave: ${this.schoolKey}`,{align:"left"})
        .moveDown(5)
    }

    writeFooter(){
        this.PDFInstance
        .text("ATENTAMENTE",{stroke:true,align:"center"})
        .moveDown(4)
        .text("Ing. Ernesto Pruneda Mar",{stroke:true,align:"center"})
        .text("Jefe de Servicios Escolares",{stroke:true,align:"center"})
        .end()
    }

    endDocument(){
        if(this.documentType != 3){
            this.PDFInstance
            .text("",this.marginDocument,this.PDFInstance.y)
            .moveDown(2)
            .text(`Se extiende la presente a solicitud del interesado en la ciudad de Durango, Dgo., a los ${this.dateDay} días del mes de ${this.dateMonth} de ${this.dateYear}. `,this.marginXDocument,this.PDFInstance.y,{align:"left"})
            .moveDown(5)
            this.writeFooter()
        }
        this.PDFInstance.end()
    }

    fillAsProofOfStudies(){
        this.writeNormalHeader()
        this.PDFInstance
        .text(`Asunto: ${document_types[0].name}`,{align:"right",stroke:true})
        .moveDown(2)
        .text("A quien corresponda:",)
        .moveDown(2)
        .text("El que suscribe ",{continued:true,align:'justify'})
        .text(`${this.susbribePerson}`,{stroke:true,continued:true})
        .text(`${this.workStation} del ${this.schoolName}, clave `,{stroke:false,continued:true})
        .text(`${this.schoolKey} `,{stroke:true,continued:true})
        .text("hace constar que el C. ",{stroke:false,continued:true})
        .text("xxxxxxxxxxxxxxxxxxxx ",{stroke:true,continued:true})
        .text("con número de matricula: ",{stroke:false,continued:true})
        .text("xxxxxxxxxxxx ",{stroke:true,continued:true})
        .text("es alumno y está inscrito en la ",{stroke:false,continued:true})
        .text("xxxxxxxxxxxx ",{stroke:true,continued:true})
        .text("en esta Institución.",{stroke:false,continued:true})
        
    }

    addGradesToProofOfStudies(){
        let pageWidthWithMargin = this.PDFInstance.options.size[0] - (this.PDFInstance.x * 2)
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
        tableHeaders = tableHeaders.map( h => ({...h,width : pageWidthWithMargin*h.width}))
        this.createTable(tableHeaders)
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

    fillAsMasterLetter(){
        this.writeNormalHeader()
        this.PDFInstance
        .text("Lic. Claudia Liliana Calvo Quinteros",{stroke:true,align:"justify"})
        .text("Directora de Servicios Periciales del Estado de Durango.",{stroke:true})
        .text("P R E S E N T E.-",{stroke:true})
        .moveDown(3)
        .text("De la manera más atenta me dirijo a usted para solicitar se le permita realizar sus ",{stroke:false,continued:true})
        .text("prácticas profesionales ",{stroke:true,continued:true})
        .text("en esa institución a su digno cargo a al C.",{stroke:false,continued:true})
        .text("Jovanna Nafthaly de los Ángeles Segovia Segovia ",{stroke:true,continued:true})
        .text("es alumna de este instituto que ha sido aprobada para hacer sus ",{stroke:false,continued:true})
        .text("prácticas profesionales",{stroke:true,continued:false})
        .moveDown()
        .text("Para su liberación debe cubrir un total de 240 horas de trabajo efectivo en un periodo de cuatro meses, firmados y sellados por la dependencia en los cuáles deberá de especificar (fechas de inicio y término de las mismas), y área o departamento en el que se desempeña y actividades que realiza, propias de la carrera.",{stroke:false})
    }

    fillAsLetterOfIntership(){
        this.writeLetterOfIntershipHeader()
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
    }
}

module.exports = AlePDFDocument
