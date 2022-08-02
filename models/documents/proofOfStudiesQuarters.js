const { document_types } = require("../../types/dictionaries");
const { AlePDFDocument } = require("../alePDFDocument");

class ProofOfStudiesQuarters extends AlePDFDocument {
  constructor(student = {}) {
    super(student);
    this.fillDocument();
    this.writeExpeditionDate();
    this.writeFooter();
    super.endDocument();
  }

  fillDocument() {
    super.writeHeaderOnlyImg();
    this.PDFInstance.y -= 100;
    this.PDFInstance.x += 130;
    this.PDFInstance.font("regular-bold")
      .fontSize(12)
      .text(`Asunto: ${document_types[0].name}`, { align: "right" })
      .moveDown(0.3)
      .text("A quien corresponda:")
      .moveDown(0.3)
      .font("regular")
      .text(`${this.peopleToSign[2].article} que suscribe `, {
        continued: true,
        align: "justify",
      })
      .font("regular-bold")
      .text(`${this.peopleToSign[2].name} `, { continued: true })
      .font("regular")
      .text(
        `${this.peopleToSign[2].workstation} del ${this.schoolShortName}, clave `,
        { continued: true }
      )
      .font("regular-bold")
      .text(`${this.schoolKey} `, { continued: true })
      .font("regular")
      .text(
        `hace constar que ${this.student.gendre == "F" ? "la" : "el"} C. `,
        { continued: true }
      )
      .font("regular-bold")
      .text(`${this.student.student_name} `, { continued: true })
      .font("regular")
      .text("con número de matricula: ", { continued: true })
      .font("regular-bold")
      .text(`${this.student.matricula} `, { continued: true })
      .font("regular")
      .text(
        `es ${this.student.gendre == "F" ? "alumna" : "alumno"} y está ${
          this.student.gendre == "F" ? "inscrita" : "inscrito"
        } en la `,
        { continued: true }
      )
      .font("regular-bold")
      .text(`${this.student.major_name} `, { continued: true })
      .font("regular")
      .text("en esta Institución.", { continued: this.hasGrades })
      .text("Y ha cursado las siguientes materias: ");

    this.PDFInstance.x = this.marginXDocument;
    this.addGrades();
  }

  splitGradesIntoQuarters() {
    let quarter = 1;
    const coursesForQuarter = 4;
    const quarterNames = [
      "Primer",
      "Segundo",
      "Tercer",
      "Cuarto",
      "Quinto",
      "Sexto",
      "Septimo",
      "Octavo",
      "Noveno",
      "Decimo",
    ];
    let gradesInQuarters = [];
    let gradesInQuarter = { grades: [], average: 0 };
    this.student.grades.forEach(({ grade, course }, index) => {
      gradesInQuarter.grades = [...gradesInQuarter.grades, { course, grade }]; // Insert grades of the quarter
      gradesInQuarter.average = gradesInQuarter.average + parseFloat(grade); // Make the sum of the grades when they're being added
      if (index + 1 === coursesForQuarter * quarter) {
        // Insert quarter into the array when I accomulate the number of courses per quarter
        gradesInQuarter.quarterName = `${
          quarterNames[quarter - 1]
        } Cuatrimestre`;
        gradesInQuarter.average /= coursesForQuarter;
        gradesInQuarter.average = parseFloat(
          gradesInQuarter.average.toFixed(2)
        );
        gradesInQuarters.push(gradesInQuarter);
        quarter++;
        gradesInQuarter = { grades: [], average: 0 };
      }
    });
    return gradesInQuarters;
  }

  addGrades() {
    // let pageWidthWithMargin = this.PDFInstance.options.size[0] - (this.PDFInstance.x * 2)
    let colMarginX = this.PDFInstance.x;
    let initColMarginY = this.PDFInstance.y;
    let col = 1;
    this.student.grades = this.splitGradesIntoQuarters();
    let tableHeadersGrades = [
      {
        id: "courseName",
        header: "Materia",
        width: 0.35,
        renderer: (tb, data, draw, column, pos) => {
          // Change the font size depending on the amount of grades from the student
          tb.pdf.fontSize(10);
          return data.courseName;
        },
      },
      { id: "grade", header: "Calif.", width: 0.15, align: "center" },
    ];
    tableHeadersGrades = tableHeadersGrades.map((h) => ({
      ...h,
      width: this.pageWidthWithMargin * h.width,
    }));

    while (this.student.grades.length > 0) {
      colMarginX =
        (col - 1) *
          ((this.PDFInstance.options.size[0] - this.marginXDocument * 2) *
            0.5) +
        this.marginXDocument;
      this.PDFInstance.y = initColMarginY;
      while (true) {
        const quarter = this.student.grades.shift();
        if (!quarter) break;
        let tableHeadersQuarter = [
          {
            id: "quarterName",
            header: quarter.quarterName,
            width: 0.5,
            renderer: (tb, data, draw, column, pos) => {
              // Change the font size depending on the amount of grades from the student
              tb.pdf.fontSize(10).font("regular-bold");
              return data.courseName;
            },
          },
        ];
        tableHeadersQuarter = tableHeadersQuarter.map((h) => ({
          ...h,
          width: this.pageWidthWithMargin * h.width,
        }));
        this.createTable(tableHeadersQuarter, {
          headerBorder: ["T", "R", "B", "L"],
          cellBorder: ["T", "R", "B", "L"],
          headerPadding: [5, 5, 5, 5],
          padding: [1.2, 1.2, 1.2, 1.2],
        });

        this.tableDocument.addBody([]);
        this.PDFInstance.x = colMarginX;
        //
        this.createTable(tableHeadersGrades, {
          headerBorder: ["T", "R", "B", "L"],
          cellBorder: ["T", "R", "B", "L"],
          headerPadding: [5, 5, 5, 5],
          padding: [1.2, 1.2, 1.2, 1.2],
        });
        this.tableDocument.addBody(
          quarter.grades.map(({ grade, course: courseName }) => ({
            grade,
            courseName,
          }))
        );
        this.PDFInstance.x = colMarginX;
        if (
          this.PDFInstance.options.size[1] -
            this.marginYDocument -
            this.PDFInstance.y <=
          150
        ) {
          if (col == 2) {
            this.PDFInstance.addPage();
            col = 0;
          }
          col++;
          break;
        }
      }
    }
  }

  writeExpeditionDate() {
    this.PDFInstance.text("", this.marginDocument, this.PDFInstance.y);
    this.PDFInstance.moveDown(this.student.grades.length < 16 ? 2 : 0.4);
    this.PDFInstance.text(
      `Se extiende la presente a solicitud del interesado en la ciudad de Durango, Dgo., a los ${this.dateDay} días del mes de ${this.dateMonth} de ${this.dateYear}. `,
      this.marginXDocument,
      this.PDFInstance.y,
      { align: "left" }
    );
    this.PDFInstance.moveDown(this.student.grades.length < 16 ? 5 : 0.4);
  }
}
module.exports = ProofOfStudiesQuarters;
