const {AlePDFDocument} = require("../alePDFDocument");

class Title extends AlePDFDocument{
    imagesSize = 80
    imagesYPos = 0
    durangoShieldXPosFixed =(this.PDFInstance.options.size[0] - this.PDFInstance.x) - this.imagesSize

    constructor(){
        super()
        this.fillDocument()
    }
    
    writeHeader(){
        this.PDFInstance
        .font('Helvetica-Bold')
        .fontSize(18)
        .text("GOBIERNO DEL ESTADO DE DURANGO",{align:'center'})
        .moveDown(0.5)
        // Get y pos from the cursor and assigned it to both images
        this.imagesYPos = this.PDFInstance.y
        this.PDFInstance
        .image("types/icon.jpg",this.marginXDocument,this.imagesYPos,{fit:[this.imagesSize,this.imagesSize],})
        .image("types/durangoShield.jpg",this.durangoShieldXPosFixed,this.imagesYPos,{fit:[this.imagesSize,this.imagesSize]})
        this.PDFInstance
        .moveUp(0.5)
        .text("SECRETARIA DE EDUCACIÓN",{align:'center'})
        .moveDown(1)
        .fontSize(12)
        .text("INSTITUTO DE EDUCACIÓN Y CULTURA ALEJANDRÍA",{align:'center'})
        .moveDown(3)
    }

    fillDocument(){
        let pdfBodyDocumentYPos = 0
        let sendTxtPosX = 0
        let sendTxtPosY = 0
        let bodyDocumentOpts = {}
        this.writeHeader() // Insert document's header
        pdfBodyDocumentYPos = this.PDFInstance.y
        this.PDFInstance
        .ellipse(this.PDFInstance.x+10,pdfBodyDocumentYPos+95,60,95).stroke()
        .fontSize(8)
        .rect(this.PDFInstance.x-50,pdfBodyDocumentYPos*2,this.PDFInstance.x+50,0).stroke()
        .text("Firma del alumno.",50,pdfBodyDocumentYPos*2+15)
        .fontSize(14)
        .text("OTORGA A",this.marginXDocument,pdfBodyDocumentYPos,{align:'center'})
        .moveDown(3)
        .fontSize(10)
        .text("xxxxxxxxxxxxxxxxxxx",{align:'center'})
        .moveDown(3)
        .fontSize(14)
        .text("EL TÍTULO DE",{align:'center'})
        .fontSize(10)
        .text("xxxxxxxxxxxxxxxxxxxxx",{align:'center'})
        .moveDown(4)
        sendTxtPosX = this.PDFInstance.x + this.imagesSize
        sendTxtPosY = this.PDFInstance.y
        bodyDocumentOpts = {align:'justify',width:this.PDFInstance.options.size[0] - (this.marginXDocument*2 + this.imagesSize*2),lineGap:2}
        this.PDFInstance
        .fontSize(11)
        .font('regular')
        .text("En virtud de que acreditó los estudios conforme al Plan y Programas que han sido reconocidos para esta Carrera. Con fundamento en los Artículos 153 y 163, párrafo II de la Ley de Educación del Estado de Durango y después de haber aprobado el Examen Profesional  Reglamentario que sustentó el día 28 de Agosto del 2019.",sendTxtPosX,sendTxtPosY,bodyDocumentOpts)
        .moveDown(2)
        this.writeSendDocumentTxt(sendTxtPosX,undefined,bodyDocumentOpts)
        this.PDFInstance
        .moveDown(2)
        let linesToSignPosY = this.PDFInstance.y
        this.drawLineToSign(this.marginXDocument,linesToSignPosY,180,{txtButtom:"MTRA. JULIETA HERNÁNDEZ CAMARGO",alignTxtButtom:'center',fontsSizeTxtButton:[8]})
        this.drawLineToSign(this.PDFInstance.options.size[0]-this.marginXDocument-180,linesToSignPosY,180,{txtButtom:"C.P. RUBÉN CALDERÓN LUJAN",alignTxtButtom:'center',fontsSizeTxtButton:[8]})
        // Type info about the title
        this.PDFInstance.addPage()
        let infoTxtPosY = this.PDFInstance.y
        let infoTxtSquareWidth = (this.PDFInstance.options.size[0]-this.marginXDocument) / 2
        // Type and draw the first square the info is in.
        this.PDFInstance
        .fontSize(10)
        .text('El presente Título quedó registrado en la Coordinación de Educación Media Superior, Superior y Particular de la Secretaría de Educación del Estado de Durango, en cumplimiento a lo dispuesto por los Artículos 8, 17, 18 y 54 del Reglamento para la Educación que imparten los Particulares, en la ciudad de Victoria de Durango, Dgo.', (this.marginXDocument/2)+ 5,this.PDFInstance.y + 5,{width : infoTxtSquareWidth-15,align:'justify'}).moveDown(2)
        .text('Fecha: __________________').moveDown(1.5)
        .text('En la hoja No.: __________________').moveDown(1.5)
        .text('Del libro No.: __________________').moveDown(1.5)
        .text('Con el folio: __________________').moveDown(4)
        .text('Sello').moveDown(2)
        this.drawLineToSign((this.marginXDocument/2) + (infoTxtSquareWidth/2)-50,this.PDFInstance.y,100,{txtButtom:"sutanito~jefe de jefes",alignTxtButtom:'center',fontsSizeTxtButton:[8]})
        this.PDFInstance.rect(this.marginXDocument/2,infoTxtPosY,infoTxtSquareWidth-5,this.PDFInstance.y - infoTxtPosY + 10).stroke()
        // Type and draw the second square the info is in.
        this.PDFInstance
        .fontSize(10)
        .text('El presente Título quedó registrado en el Instituto de Educación y Cultura Alejandría incorporado al Sistema Estatal de Educación con Reconocimiento de Validez Oficial de Estudios, otorgado por la Secretaría de Educación del Estado de Durango según Acuerdo No. 293 de fecha 04 de octubre de 2004, con CCT 10PSU0020G.',infoTxtSquareWidth + (this.marginXDocument/2) + 10,infoTxtPosY+5,{width : infoTxtSquareWidth-15,align:'justify'}).moveDown(4.5)
        .text('En la hoja No.: __________________').moveDown(1.5)
        .text('Del libro No.: __________________').moveDown(1.5)
        .text('Con el folio: __________________').moveDown(4)
        .text('Sello').moveDown(2)
        this.drawLineToSign((this.marginXDocument/2) + (infoTxtSquareWidth*1.5)-50 ,this.PDFInstance.y,100,{txtButtom:"sutanito~jefe de jefes 2",alignTxtButtom:'center',fontsSizeTxtButton:[8]})
        this.PDFInstance.rect(infoTxtSquareWidth + (this.marginXDocument/2) + 5,infoTxtPosY,infoTxtSquareWidth-5,this.PDFInstance.y - infoTxtPosY + 10).stroke()        
        // Draw legalization of government signs and teacher record
        this.PDFInstance
        .text("",this.marginXDocument/2, this.PDFInstance.y + 25)
        .rect(this.marginXDocument/2,this.PDFInstance.y,this.PDFInstance.options.size[0]-this.marginXDocument,150).stroke()
        .text("Legalización de firmas del Gobierno del Estado",this.marginXDocument, this.PDFInstance.y+75,{align:'center'})
        .text("",this.marginXDocument/2, this.PDFInstance.y + 85)
        .rect(this.marginXDocument/2,this.PDFInstance.y,this.PDFInstance.options.size[0]-this.marginXDocument,this.PDFInstance.options.size[1]-this.PDFInstance.y-this.marginYDocument).stroke()
        .text("Registro en la Dirección de Profesiones",this.marginXDocument, this.PDFInstance.y + (this.PDFInstance.options.size[1]-this.PDFInstance.y-this.marginYDocument)/2,{align:'center'})
        this.endDocument()
    }
}

module.exports = Title;
