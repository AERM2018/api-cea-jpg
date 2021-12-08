const PDFKit = require('pdfkit');
const PDFTable = require('voilab-pdf-table');
const moment = require('moment');
const path = require('path');
class AlePDFDocument{
    PDFInstance = PDFKit;
    documentType = 0;
    susbribePerson = "Ing. Ernesto Pruneda Mar"
    workStation = "Jefe de Servicios Escolares"
    principalName = "Mtra. Julieta Hernández Camargo"
    schoolShortName = "Instituto Alejandría"
    schoolName = "Instituto de Educación y Cultura Alejandría S.C."
    schoolKey = "10PSU0020G"
    dateYear = 0
    dateMonth = ""
    dateDay = 0
    marginDocument = 0;
    pageWidthWithMargin = 0
   
    
    constructor(){
        this.PDFInstance = new PDFKit({size:[595.28,841.89]})
        // this.PDFInstance = new PDFKit({size:[612.00,936.00]})
        this.marginXDocument = this.PDFInstance.x
        this.marginYDocument = this.PDFInstance.y
        this.pageWidthWithMargin = this.PDFInstance.options.size[0] - (this.marginXDocument * 2)
        this.formatDate()
        this.PDFInstance.registerFont('regular',path.join(__dirname,'documents','fonts','arial.ttf'))
        this.PDFInstance.registerFont('regular-bold',path.join(__dirname,'documents','fonts','arial-bold.ttf'))
    }

    formatDate(){
        const date = moment().format("YYYY-MMMM-DD")
        const [year,month,day] = date.split("-")
        this.dateYear = year
        this.dateMonth = month
        this.dateDay = day
    }

    createTable(headers=[],opts = {headerBorder:[],cellBorder:[],headerPadding:[],padding:[]}){
        this.tableDocument = new PDFTable(this.PDFInstance,{
            columnsDefaults : {
                headerBorder : opts.headerBorder,
                border : opts.cellBorder,
                headerPadding : opts.headerPadding,
                padding : opts.padding
            },
        })
        this.tableDocument.addColumns(headers)
    }
    
    setTableButtomBorder = (lastIndex) =>{
        this.tableDocument.onRowAdd((table,row,rowIdx)=>{
            if(rowIdx == lastIndex){
                table.onCellBorderAdd((table,col,row,isHeader)=>{
                    col.border = ['B','L','R']
                })
            }
        })
    }

    writeHeader(){
        this.PDFInstance
        .image('types/icon.jpg',this.PDFInstance.x,this.PDFInstance.y,{ fit : [100,100]})
        .moveDown()
        .fontSize(15)
        .text(`${this.schoolName}`,{align:'center'})
        .moveDown()
        .rect(this.PDFInstance.x,this.PDFInstance.y,(this.PDFInstance.options.size[0]-this.PDFInstance.x*2),0).stroke()
        .moveDown(0.5)
        .fontSize(10)
        .text("Ayuntamiento No. 618 Nte, Durango,Dgo.")
        .moveUp()
        .text("Tel (618) 8 11 75 06",{align:"right"})
        .moveDown(2)
    }

    writeHeader2(){
        this.PDFInstance
        .image('types/icon.jpg',this.PDFInstance.x-(this.marginXDocument*.5),this.PDFInstance.y,{fit:[100,100]})
        .fontSize(16)
        .text(`${this.schoolName}`,this.marginXDocument*.5+110,this.marginYDocument+10)
        .fontSize(9)
        .moveDown(2)
        .text(`Incorporado al Sistema Estatal de Educación, con Reconocimiento de Validez Oficial de Estudios otorgado por la Secretaría de Educación del Estado de Durango, según Acuerdo Número 293 de fecha 04 de octubre de 2004 Clave: ${this.schoolKey}`,{align:'justify',})
    }

    writeFooter(){
        this.PDFInstance
        .font('Helvetica-Bold')
        .fontSize(12)
        // .moveDown(2)
        .text("ATENTAMENTE",this.marginXDocument,this.PDFInstance.y,{align:"center"})
        .moveDown(4)
        .text("Ing. Ernesto Pruneda Mar",{align:"center"})
        .text("Jefe de Servicios Escolares",{align:"center"})
    }

    writeSendDocumentTxt(posX = this.PDFInstance.y, posY  = this.PDFInstance.y, opts = {}){
        this.PDFInstance
        .moveDown(2)
        .text(`Expedido en la ciudad de Victoria de Durango, Dgo., a los veinte días del mes de Septiembre del año dos mil diecinueve`,posX,posY,opts)
    }

    endDocument(){
        // if(this.documentType != 3){
        //     this.PDFInstance
        //     .text("",this.marginDocument,this.PDFInstance.y)
        //     .moveDown(2)
        //     .text(`Se extiende la presente a solicitud del interesado en la ciudad de Durango, Dgo., a los ${this.dateDay} días del mes de ${this.dateMonth} de ${this.dateYear}. `,this.marginXDocument,this.PDFInstance.y,{align:"left"})
        //     .moveDown(5)
        //     this.writeFooter()
        // }
        this.PDFInstance.end()
    }

    drawKardexTable(testFolio = false){
        this.PDFInstance.fontSize(8)
        let tableHeaders = [
            {id: "Clave",header: "Clave",width: 0.1,},
            {id: "Asignatura",header: "Asignatura",width: 0.2},
            {id: "Creditos",header: "Creditos",width: 0.1,},
            {id: "Calificaciones",header: "Calificaciones",width: 0.3},
            {id: "Fecha de examen",header: "Fecha de examen",width: 0.15,},
            {id: "Tipo de examen",header: "Tipo de examen",width: 0.15,},
          ];
          let tableSubHeaders = [
            {id: "key",width: 0.1,},
            {id: "subject",width: 0.2,},
            {id: "credits",width: 0.1,},
            {id: "gradesNum",header: "No.",width: 0.15,headerBorder: ["B", "T", "L", "R"],},
            {id: "gradesLetter",header: "Letra",width: 0.15,headerBorder: ["B", "T", "L", "R"],},
            {id: "dateTest",width: 0.15,},
            {id: "typeTest",width: 0.15,},
          ];
          if (testFolio){
              // Put the test folio field in the table
              let lastItem = tableHeaders.pop()
              tableHeaders.push({id:"Folio de acta",header:"Folio del acta",width:0.1})
              tableHeaders.push(lastItem)
              lastItem = tableSubHeaders.pop()
              tableSubHeaders.push({id:"testFolio",width:0.1})
              tableSubHeaders.push(lastItem);
              tableHeaders = tableHeaders.map(header => {
                  if(header.id == "Calificaciones"){
                     return {...header,width: 0.2}
                  }
                  return header;
              })
              tableSubHeaders = tableSubHeaders.map(header => {
                if(header.id == "gradesNum" || header.id == "gradesLetter"){
                   return {...header,width: 0.10}
                }
                return header;
            })
          }
          // Set the header's width respect to the sheet's size
          tableHeaders = tableHeaders.map((h) => ({
            ...h,
            width: this.pageWidthWithMargin * h.width,
          }));
          this.createTable(tableHeaders, {
            headerBorder:["T", "L", "R",],
            cellBorder:["L", "R",],
            headerPadding:[5,5,5,5]
          });
          this.tableDocument.addBody([]);
          this.PDFInstance.x = this.marginXDocument;
          tableSubHeaders = tableSubHeaders.map((h) => ({
            ...h,
            width: this.pageWidthWithMargin * h.width,
          }));
          this.createTable(tableSubHeaders,{
            headerBorder:["B", "L", "R"],
            cellBorder: [ "L", "R",],
            headerPadding:[5,5,5,5],
            padding:[0,5,0,5]
          });
         
    }

    drawLineToSign(posX = this.PDFInstance.x, posY = this.PDFInstance.y, long = 0, opts = {txtButtom : "", alignTxtButtom : "left",fontsSizeTxtButton : []}){
        let words = opts.txtButtom.split('~')
        this.PDFInstance
        .rect(posX,posY,long,0).stroke()
        for (let i = 0; i < words.length; i++) {
            this.PDFInstance
            .fontSize(parseInt(`${(opts.fontsSizeTxtButton.length == 1)?opts.fontsSizeTxtButton[0]:opts.fontsSizeTxtButton[i]}`))
            .text(words[i],parseFloat(`${opts.alignTxtButtom == 'left'?posX:posX+((long - this.PDFInstance.text().widthOfString(words[i])) / 2)}`),posY+5)
            posY = this.PDFInstance.y
        }
        
    }

    // fillAsProofOfStudies(){
    //     this.writeNormalHeader()
    //     this.PDFInstance
    //     .text(`Asunto: ${document_types[0].name}`,{align:"right",stroke:true})
    //     .moveDown(2)
    //     .text("A quien corresponda:",)
    //     .moveDown(2)
    //     .text("El que suscribe ",{continued:true,align:'justify'})
    //     .text(`${this.susbribePerson}`,{stroke:true,continued:true})
    //     .text(`${this.workStation} del ${this.schoolName}, clave `,{stroke:false,continued:true})
    //     .text(`${this.schoolKey} `,{stroke:true,continued:true})
    //     .text("hace constar que el C. ",{stroke:false,continued:true})
    //     .text("xxxxxxxxxxxxxxxxxxxx ",{stroke:true,continued:true})
    //     .text("con número de matricula: ",{stroke:false,continued:true})
    //     .text("xxxxxxxxxxxx ",{stroke:true,continued:true})
    //     .text("es alumno y está inscrito en la ",{stroke:false,continued:true})
    //     .text("xxxxxxxxxxxx ",{stroke:true,continued:true})
    //     .text("en esta Institución.",{stroke:false,continued:true})
        
    // }

    // addGradesToProofOfStudies(){
    //     let pageWidthWithMargin = this.PDFInstance.options.size[0] - (this.PDFInstance.x * 2)
    //     let tableHeaders = [{
    //             id : "courseName",
    //             header : "Materia",
    //             width : .5
    //         },
    //         {
    //             id : "grade",
    //             header : "Calificación",
    //             width : .5
    //         }
    //     ]
    //     tableHeaders = tableHeaders.map( h => ({...h,width : pageWidthWithMargin*h.width}))
    //     this.createTable(tableHeaders)
    //     this.PDFInstance
    //     .text("Y ha cursado las siguientes materias: ")
    //     this.PDFInstance.moveDown()
    //     this.tableDocument.addBody([{
    //         courseName : "xxxxxxxxxxxx",
    //         grade : 10
    //     },{
    //         courseName : "xxxxxxxxxxxx",
    //         grade : 10
    //     },])
        
    // }

    // fillAsMasterLetter(){
    //     this.writeNormalHeader()
    //     this.PDFInstance
    //     .text("Lic. Claudia Liliana Calvo Quinteros",{stroke:true,align:"justify"})
    //     .text("Directora de Servicios Periciales del Estado de Durango.",{stroke:true})
    //     .text("P R E S E N T E.-",{stroke:true})
    //     .moveDown(3)
    //     .text("De la manera más atenta me dirijo a usted para solicitar se le permita realizar sus ",{stroke:false,continued:true})
    //     .text("prácticas profesionales ",{stroke:true,continued:true})
    //     .text("en esa institución a su digno cargo a al C.",{stroke:false,continued:true})
    //     .text("Jovanna Nafthaly de los Ángeles Segovia Segovia ",{stroke:true,continued:true})
    //     .text("es alumna de este instituto que ha sido aprobada para hacer sus ",{stroke:false,continued:true})
    //     .text("prácticas profesionales",{stroke:true,continued:false})
    //     .moveDown()
    //     .text("Para su liberación debe cubrir un total de 240 horas de trabajo efectivo en un periodo de cuatro meses, firmados y sellados por la dependencia en los cuáles deberá de especificar (fechas de inicio y término de las mismas), y área o departamento en el que se desempeña y actividades que realiza, propias de la carrera.",{stroke:false})
    // }

    // fillAsLetterOfIntership(){
    //     this.writeLetterOfIntershipHeader()
    //     this.PDFInstance
    //     .moveDown(3)
    //     .fontSize(24).font('Times-Bold')
    //     .text("C A R T A  D E  P A S A N T E",this.marginXDocument,this.PDFInstance.y,{align:"center"})
    //     .moveDown(2)
    //     .fontSize(18)
    //     .text("A: xxxxxxxxxxxxxxxxxxxxx",{align:"center"})
    //     .moveDown(2)
    //     .text("Curso y aprobó las asignaturas correspondientes al Plan de Estudios de la xxxxxxxxxxxx.")
    //     .moveDown(2)
    //     .text(`Comprobada su escolaridad, mediante previa y rigurosa revisión curricular y con fundamento en los Artículos 16, 153 y 163 párrafo II de la ley de Educación del Estado de Durango, se extiende la presente en Durango, Dgo., a los veinticinco días del mes de ${this.dateDay} del año dos mil veintiuno`)
    //     .moveDown(5)
    //     .fontSize(13)
    //     .text(`${this.principalName}`,{align:"center"})
    //     .text("Directora",{align:"center"})
    // }

    // fillAsBachelorsTitle(){
    //     //TODO: quitar datos estaticos y remplazarlos por dinamicos
    //     let imagesSize = 80
    //     let imagesYPos = 0
    //     let durangoShieldXPosFixed =(this.PDFInstance.options.size[0] - this.PDFInstance.x) - imagesSize
    //     let pdfBodyDocumentYPos = 0
    //     let sendTxtPosX = 0
    //     let sendTxtPosY = 0
    //     let bodyDocumentOpts = {}
    //     this.PDFInstance
    //     .font('Helvetica-Bold')
    //     .fontSize(18)
    //     .text("GOBIERNO DEL ESTADO DE DURANGO",{align:'center'})
    //     .moveDown(0.5)
    //     // Get y pos from the cursor and assigned it to both images
    //     imagesYPos = this.PDFInstance.y
    //     this.PDFInstance
    //     .image("types/icon.jpg",this.marginXDocument,imagesYPos,{fit:[imagesSize,imagesSize],})
    //     .image("types/durangoShield.jpg",durangoShieldXPosFixed,imagesYPos,{fit:[imagesSize,imagesSize]})
    //     this.PDFInstance
    //     .moveUp(0.5)
    //     .text("SECRETARIA DE EDUCACIÓN",{align:'center'})
    //     .moveDown(1)
    //     .fontSize(12)
    //     .text("INSTITUTO DE EDUCACIÓN Y CULTURA ALEJANDRÍA",{align:'center'})
    //     .moveDown(3)

    //     pdfBodyDocumentYPos = this.PDFInstance.y
    //     this.PDFInstance.ellipse(this.PDFInstance.x+10,pdfBodyDocumentYPos+95,60,95).stroke()
    //     .fontSize(8)
    //     .rect(this.PDFInstance.x-50,pdfBodyDocumentYPos*2,this.PDFInstance.x+50,0).stroke()
    //     .text("Firma del alumno.",50,pdfBodyDocumentYPos*2+15)
    //     .fontSize(14)
    //     .text("OTORGA A",this.marginXDocument,pdfBodyDocumentYPos,{align:'center'})
    //     .moveDown(3)
    //     .fontSize(10)
    //     .text("xxxxxxxxxxxxxxxxxxx",{align:'center'})
    //     .moveDown(3)
    //     .fontSize(14)
    //     .text("EL TÍTULO DE",{align:'center'})
    //     .fontSize(10)
    //     .text("xxxxxxxxxxxxxxxxxxxxx",{align:'center'})
    //     .moveDown(4)
    //     sendTxtPosX = this.PDFInstance.x + imagesSize
    //     sendTxtPosY = this.PDFInstance.y
    //     bodyDocumentOpts = {align:'justify',width:this.PDFInstance.options.size[0] - (this.marginXDocument*2 + imagesSize*2),lineGap:2}
    //     this.PDFInstance
    //     .fontSize(11)
    //     .text("En virtud de que acreditó los estudios conforme al Plan y Programas que han sido reconocidos para esta Carrera. Con fundamento en los Artículos 153 y 163, párrafo II de la Ley de Educación del Estado de Durango y después de haber aprobado el Examen Profesional  Reglamentario que sustentó el día 28 de Agosto del 2019.",sendTxtPosX,sendTxtPosY,bodyDocumentOpts)
    //     .moveDown(2)
    //     this.writeSendDocumentTxt(sendTxtPosX,undefined,bodyDocumentOpts)
    //     this.PDFInstance
    //     .moveDown(2)
    //     let linesToSignPosY = this.PDFInstance.y
    //     this.drawLineToSign(this.marginXDocument,linesToSignPosY,180,"MTRA. JULIETA HERNÁNDEZ CAMARGO",'center')
    //     this.drawLineToSign(this.PDFInstance.options.size[0]-this.marginXDocument-180,linesToSignPosY,180,"C.P. RUBÉN CALDERÓN LUJAN",'center')
    //     // Type info about the title
    //     this.PDFInstance.addPage()
    //     let infoTxtPosY = this.PDFInstance.y
    //     let infoTxtSquareWidth = (this.PDFInstance.options.size[0]-this.marginXDocument) / 2
    //     // Type and draw the first square the info is in.
    //     this.PDFInstance
    //     .fontSize(10)
    //     .text('El presente Título quedó registrado en la Coordinación de Educación Media Superior, Superior y Particular de la Secretaría de Educación del Estado de Durango, en cumplimiento a lo dispuesto por los Artículos 8, 17, 18 y 54 del Reglamento para la Educación que imparten los Particulares, en la ciudad de Victoria de Durango, Dgo.', (this.marginXDocument/2)+ 5,this.PDFInstance.y + 5,{width : infoTxtSquareWidth-15,align:'justify'}).moveDown(2)
    //     .text('Fecha: __________________').moveDown(1.5)
    //     .text('En la hoja No.: __________________').moveDown(1.5)
    //     .text('Del libro No.: __________________').moveDown(1.5)
    //     .text('Con el folio: __________________').moveDown(4)
    //     .text('Sello').moveDown(2)
    //     this.drawLineToSign((this.marginXDocument/2) + (infoTxtSquareWidth/2)-50,this.PDFInstance.y,100,"sutanito~jefe de jefes",'center')
    //     this.PDFInstance.rect(this.marginXDocument/2,infoTxtPosY,infoTxtSquareWidth-5,this.PDFInstance.y - infoTxtPosY + 10).stroke()
    //     // Type and draw the second square the info is in.
    //     this.PDFInstance
    //     .fontSize(10)
    //     .text('El presente Título quedó registrado en el Instituto de Educación y Cultura Alejandría incorporado al Sistema Estatal de Educación con Reconocimiento de Validez Oficial de Estudios, otorgado por la Secretaría de Educación del Estado de Durango según Acuerdo No. 293 de fecha 04 de octubre de 2004, con CCT 10PSU0020G.',infoTxtSquareWidth + (this.marginXDocument/2) + 10,infoTxtPosY+5,{width : infoTxtSquareWidth-15,align:'justify'}).moveDown(5.5)
    //     .text('En la hoja No.: __________________').moveDown(1.5)
    //     .text('Del libro No.: __________________').moveDown(1.5)
    //     .text('Con el folio: __________________').moveDown(4)
    //     .text('Sello').moveDown(2)
    //     this.drawLineToSign((this.marginXDocument/2) + (infoTxtSquareWidth*1.5)-50 ,this.PDFInstance.y,100,"sutanito~jefe de jefes 2",'center')
    //     this.PDFInstance.rect(infoTxtSquareWidth + (this.marginXDocument/2) + 5,infoTxtPosY,infoTxtSquareWidth-5,this.PDFInstance.y - infoTxtPosY + 10).stroke()        
    //     // Draw legalization of government signs
    //     this.PDFInstance
    //     .text("",this.marginXDocument/2, this.PDFInstance.y + 25)
    //     .rect(this.marginXDocument/2,this.PDFInstance.y,this.PDFInstance.options.size[0]-this.marginXDocument,150).stroke()
    //     .text("Legalización de firmas del Gobierno del Estado",this.marginXDocument, this.PDFInstance.y+75,{align:'center'})

    //     this.PDFInstance
    //     .text("",this.marginXDocument/2, this.PDFInstance.y + 85)
    //     .rect(this.marginXDocument/2,this.PDFInstance.y,this.PDFInstance.options.size[0]-this.marginXDocument,this.PDFInstance.options.size[1]-this.PDFInstance.y-this.marginYDocument).stroke()
    //     .text("Registro en la Dirección de Profesiones",this.marginXDocument, this.PDFInstance.y + (this.PDFInstance.options.size[1]-this.PDFInstance.y-this.marginYDocument)/2,{align:'center'})
    // }
}

module.exports = {
    AlePDFDocument
};
