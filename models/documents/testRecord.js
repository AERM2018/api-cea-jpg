const { AlePDFDocument } = require("../alePDFDocument");
const moment = require('moment');

class TestRecord extends AlePDFDocument{
    constructor(tools){
        super()
        this.tests = tools
        this.writeHeader()
        this.fillDocument()
        this.endDocument()
    }

    fillDocument(){
        this.PDFInstance
        .font('regular-bold')
        .text(`${this.tests.major_name.toUpperCase()}`,{align:'center'})
        .moveDown(3)
        .text(`FECHA: `,{align:'left',continued:true})
        .font('regular')
        .text(`${moment().format('DD-MM-YYYY')}`)
        .moveDown()
        .font('regular-bold')
        .text(`MATERIA:`,{align:'left',continued:true})
        .font('regular')
        .text(`${this.tests.course_name}`)
        .moveDown(2)
        .font('regular-bold')
        .text(`GRUPO: `,{align:'right',continued:true})
        .font('regular')
        .text(`${this.tests.name_group}`,{align:'right'})
        .moveDown(2)

        let headers = [
            {id:'id',header:'No',width:0.10,align:'center'},
            {id:'student',header:'Alumno',width:0.70,align:'center'},
            {id:'grade',header:'Calificación',width:0.20,align:'center'}
        ]
        headers = headers.map((h) => ({
            ...h,
            width: this.pageWidthWithMargin * h.width,
          }));
        this.createTable(headers,{
            headerBorder :['T','R','B','L'],
            cellBorder :['T','R','B','L'],
            headerPadding : [7,7,7,7],
            padding : [5,5,5,5],
        })
        this.tableDocument.addBody(this.tests.tests.map((test,i) => ({id:i+1,student:test.student_name})))
        this.PDFInstance.x =  this.marginXDocument
    //     this.PDFInstance.y = this.marginYDocument
    //     this.drawLineToSign(this.PDFInstance.x-this.PDFInstance.text().widthOfString(this.tests.teacher_name)/2,this.PDFInstance.y,this.PDFInstance.text().widthOfString(this.tests.teacher_name),{
    //         txtButtom : this.tests.teacher_name,
    //         alignTxtButtom : 'center',
    //         fontsSizeTxtButton : [10]
    //     })
    this.PDFInstance
    .moveDown(8)
    .text('',{align:'left'})
    .font('regular-bold')
    .fontSize(14)
    .text(`Mtro. ${this.tests.teacher_name}`,{align:'center'})
    }
}

module.exports = TestRecord
