const { AlePDFDocument } = require("../alePDFDocument");

class ExpensesReport extends AlePDFDocument{
    constructor(expenses,dateRange) {
        super()
        this.expenses = expenses
        this.dateRange = dateRange
        this.writeHeaderOnlyImg({y:25})
        this.fillDocument()
        this.endDocument()
    }
    fillDocument(){
        this.PDFInstance.y = this.marginYDocument - 20
        this.PDFInstance.x = this.marginXDocument + 150
        this.PDFInstance.font("regular-bold")
          .fontSize(24)
          .text("Reporte de gastos")
          .moveDown(0.5)
          .font("regular")
          .fontSize(15)
          .text(`Desde ${this.dateRange[0]} hasta ${this.dateRange[1]}`)
          .moveDown(2)

        this.PDFInstance.x = this.marginXDocument
        this.PDFInstance.font('regular-bold').fontSize(12);
        let headers = [
            {id:"date",header:"Fecha",width:0.2,renderer: (tb, data, draw, column, pos) => {
          tb.pdf.font('regular');
          return data.date;
        }},
            {id:"expense_type",header:"Concepto",width:0.3,renderer: (tb, data, draw, column, pos) => {
          tb.pdf.font('regular');
          return data.expense_type;
        }},
            {id:"observation",header:"Descripción",width:0.35,renderer: (tb, data, draw, column, pos) => {
          tb.pdf.font('regular');
          return data.observation;
        },},
            {id:"amount",header:"Cantidad",width:0.15,renderer: (tb, data, draw, column, pos) => {
          tb.pdf.font('regular');
          return data.amount;
        },},
        ]
        headers = headers.map((header) => ({
          ...header,
          width: this.pageWidthWithMargin * header.width,
        }));
        this.createTable(headers, {
          headerBorder: ["T", "L", "R","B"],
          cellBorder: ["L", "R","T","B"],
          headerPadding: [5, 5, 5, 5],
          padding:[5,5,5,5]
        });
        this.tableDocument.addBody(this.expenses)
    }
}

module.exports = ExpensesReport;
