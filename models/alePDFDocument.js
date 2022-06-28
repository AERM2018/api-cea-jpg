const PDFKit = require("pdfkit");
const PDFTable = require("voilab-pdf-table");
const moment = require("moment");
const path = require("path");
const conversor = require("numero-palabra");

class AlePDFDocument {
  PDFInstance = PDFKit;
  documentType = 0;
  peopleToSign = [
    {
      name: "Mtra. Julieta Hernández Camargo",
      workstation: "Directora",
      article: "La",
    },
    {
      name: "Ing. Ernesto Pruneda Mar",
      workstation: "Jefe de Servicios Escolares",
      article: "El",
    },
    {
      name: "Lic. Edna García Herrera",
      workstation: "Directora escolar",
      article: "La",
    },
    {
      name: "Profra. María Cristina Soto Soto",
      workstation: "Coordinadora",
      article: "La",
    },
  ];
  schoolShortName = "Instituto Alejandría";
  schoolName = "Instituto de Educación y Cultura Alejandría S.C.";
  schoolKey = "10PSU0020G";
  dateYear = 0;
  dateMonth = "";
  dateDay = 0;
  marginDocument = 0;
  pageWidthWithMargin = 0;

  constructor(student = {}) {
    this.PDFInstance = new PDFKit({ size: [595.28, 841.89] });
    this.student = student;
    // this.PDFInstance = new PDFKit({size:[612.00,936.00]})
    this.marginXDocument = this.PDFInstance.x;
    this.marginYDocument = this.PDFInstance.y;
    this.pageWidthWithMargin =
      this.PDFInstance.options.size[0] - this.marginXDocument * 2;
    this.formatDate();
    this.PDFInstance.registerFont(
      "regular",
      path.join(__dirname, "documents", "fonts", "arial.ttf")
    );
    this.PDFInstance.registerFont(
      "regular-bold",
      path.join(__dirname, "documents", "fonts", "arial-bold.ttf")
    );
  }

  formatDate() {
    const date = moment().format("YYYY-MMMM-DD");
    const [year, month, day] = date.split("-");
    this.dateYear = year;
    this.dateMonth = month;
    this.dateDay = day;
  }

  createTable(
    headers = [],
    opts = { headerBorder: [], cellBorder: [], headerPadding: [], padding: [] }
  ) {
    this.tableDocument = new PDFTable(this.PDFInstance, {
      columnsDefaults: {
        headerBorder: opts.headerBorder,
        border: opts.cellBorder,
        headerPadding: opts.headerPadding,
        padding: opts.padding,
      },
    });
    this.tableDocument.addColumns(headers);
  }

  setTableButtomBorder = (lastIndex) => {
    this.tableDocument.onRowAdd((table, row, rowIdx) => {
      if (rowIdx == lastIndex) {
        table.onCellBorderAdd((table, col, row, isHeader) => {
          col.border = ["B", "L", "R"];
        });
      }
    });
  };

  writeHeader(opts = { y: this.marginYDocument }) {
    this.PDFInstance.y = opts.y;
    this.PDFInstance.image(
      "types/icon.jpg",
      this.PDFInstance.x,
      this.PDFInstance.y,
      { fit: [100, 100] }
    )
      .moveDown()
      .fontSize(15)
      .text(`${this.schoolName}`, { align: "center" })
      .moveDown()
      .rect(
        this.PDFInstance.x,
        this.PDFInstance.y,
        this.PDFInstance.options.size[0] - this.PDFInstance.x * 2,
        0
      )
      .stroke()
      .moveDown(0.5)
      .fontSize(10)
      .text("Ayuntamiento No. 618 Nte, Durango,Dgo.")
      .moveUp()
      .text("Tel (618) 8 11 75 06", { align: "right" })
      .moveDown();
  }

  writeHeader2() {
    this.PDFInstance.image(
      "types/icon.jpg",
      this.PDFInstance.x - this.marginXDocument * 0.5,
      this.PDFInstance.y,
      { fit: [100, 100] }
    )
      .fontSize(16)
      .text(
        `${this.schoolName}`,
        this.marginXDocument * 0.5 + 110,
        this.marginYDocument + 10
      )
      .fontSize(9)
      .moveDown(2)
      .text(
        `Incorporado al Sistema Estatal de Educación, con Reconocimiento de Validez Oficial de Estudios otorgado por la Secretaría de Educación del Estado de Durango, según Acuerdo Número 293 de fecha 04 de octubre de 2004 Clave: ${this.schoolKey}`,
        { align: "justify" }
      );
  }

  writeFooter() {
    this.PDFInstance.font("Helvetica-Bold")
      .fontSize(12)
      // .moveDown(2)
      .text("ATENTAMENTE", this.marginXDocument, this.PDFInstance.y, {
        align: "center",
      })
      .moveDown(1)
      .text(this.peopleToSign[2].name, { align: "center" })
      .text(this.peopleToSign[2].workstation, { align: "center" });
  }

  writeSendDocumentTxt(
    posX = this.PDFInstance.y,
    posY = this.PDFInstance.y,
    opts = {}
  ) {
    this.PDFInstance.moveDown(2).text(
      `Expedido en la ciudad de Victoria de Durango, Dgo., a los ${conversor(
        Number(this.dateDay).toString()
      )} días del mes de ${this.dateMonth} del año ${conversor(
        Number(this.dateYear).toString()
      )}`,
      posX,
      posY,
      opts
    );
  }

  endDocument() {
    // if(this.documentType != 3){
    //     this.PDFInstance
    //     .text("",this.marginDocument,this.PDFInstance.y)
    //     .moveDown(2)
    //     .text(`Se extiende la presente a solicitud del interesado en la ciudad de Durango, Dgo., a los ${this.dateDay} días del mes de ${this.dateMonth} de ${this.dateYear}. `,this.marginXDocument,this.PDFInstance.y,{align:"left"})
    //     .moveDown(5)
    //     this.writeFooter()
    // }
    this.PDFInstance.end();
  }

  drawKardexTable(testFolio = false) {
    this.PDFInstance.fontSize(8);
    let tableHeaders = [
      { id: "Clave", header: "Clave", width: 0.1 },
      { id: "Asignatura", header: "Asignatura", width: 0.2 },
      { id: "Creditos", header: "Creditos", width: 0.1 },
      { id: "Calificaciones", header: "Calificaciones", width: 0.3 },
      { id: "Fecha de examen", header: "Fecha de examen", width: 0.15 },
      { id: "Tipo de examen", header: "Tipo de examen", width: 0.15 },
    ];
    let tableSubHeaders = [
      { id: "key", width: 0.1 },
      { id: "courseName", width: 0.2 },
      { id: "credits", width: 0.1 },
      {
        id: "gradeNum",
        header: "No.",
        width: 0.15,
        headerBorder: ["B", "T", "L", "R"],
      },
      {
        id: "gradeLetter",
        header: "Letra",
        width: 0.15,
        headerBorder: ["B", "T", "L", "R"],
      },
      { id: "dateTest", width: 0.15 },
      { id: "typeTest", width: 0.15 },
    ];
    if (testFolio) {
      // Put the test folio field in the table
      let lastItem = tableHeaders.pop();
      tableHeaders.push({
        id: "Folio de acta",
        header: "Folio del acta",
        width: 0.1,
      });
      tableHeaders.push(lastItem);
      lastItem = tableSubHeaders.pop();
      tableSubHeaders.push({ id: "testFolio", width: 0.1 });
      tableSubHeaders.push(lastItem);
      tableHeaders = tableHeaders.map((header) => {
        if (header.id == "Calificaciones") {
          return { ...header, width: 0.2 };
        }
        return header;
      });
      tableSubHeaders = tableSubHeaders.map((header) => {
        if (header.id == "gradeNum" || header.id == "gradeLetter") {
          return { ...header, width: 0.1 };
        }
        return header;
      });
    }
    // Set the header's width respect to the sheet's size
    tableHeaders = tableHeaders.map((h) => ({
      ...h,
      width: this.pageWidthWithMargin * h.width,
    }));
    this.createTable(tableHeaders, {
      headerBorder: ["T", "L", "R"],
      cellBorder: ["L", "R"],
      headerPadding: [5, 5, 5, 5],
    });
    this.tableDocument.addBody([]);
    this.PDFInstance.x = this.marginXDocument;
    tableSubHeaders = tableSubHeaders.map((h) => ({
      ...h,
      width: this.pageWidthWithMargin * h.width,
    }));
    this.createTable(tableSubHeaders, {
      headerBorder: ["B", "L", "R"],
      cellBorder: ["L", "R"],
      headerPadding: [5, 5, 5, 5],
      padding: [0, 5, 0, 5],
    });
  }

  drawLineToSign(
    posX = this.PDFInstance.x,
    posY = this.PDFInstance.y,
    long = 0,
    opts = { txtButtom: "", alignTxtButtom: "left", fontsSizeTxtButton: [] }
  ) {
    let words = opts.txtButtom.split("~");
    this.PDFInstance.rect(posX, posY, long, 0).stroke();
    for (let i = 0; i < words.length; i++) {
      this.PDFInstance.fontSize(
        parseInt(
          `${
            opts.fontsSizeTxtButton.length == 1
              ? opts.fontsSizeTxtButton[0]
              : opts.fontsSizeTxtButton[i]
          }`
        )
      ).text(
        words[i],
        parseFloat(
          `${
            opts.alignTxtButtom == "left"
              ? posX
              : posX +
                (long - this.PDFInstance.text().widthOfString(words[i])) / 2
          }`
        ),
        posY + 5
      );
      posY = this.PDFInstance.y;
    }
  }

  getLetterFromGrade(grade = "", decimal = false) {
    if (grade === "NP") return "No presentó";
    let partsOfGrade = grade.split(".");
    return decimal
      ? `${conversor(partsOfGrade[0])} punto ${conversor(partsOfGrade[1])}`
      : `${conversor(partsOfGrade[0])}`;
  }
}

module.exports = {
  AlePDFDocument,
};
