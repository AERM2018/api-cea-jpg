const { getGradesStudent } = require("../../helpers/students");
const { document_types } = require("../../types/dictionaries");
const { AlePDFDocument } = require("../alePDFDocument");

class ProofOfStudies extends AlePDFDocument {
  constructor(student = {}, hasGrades = false) {
    super(student);
    this.hasGrades = hasGrades;
    this.fillDocument();
    this.writeExpeditionDate();
    this.writeFooter();
    super.endDocument();
  }

  fillDocument() {
    super.writeHeader({ y: 20 });
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
        `hace constar que ${this.student.gender == "F" ? "la" : "el"} C. `,
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
        `es ${this.student.gender == "F" ? "alumna" : "alumno"} y está ${
          this.student.gender == "F" ? "inscrita" : "inscrito"
        } en la `,
        { continued: true }
      )
      .font("regular-bold")
      .text(`${this.student.major_name} `, { continued: true })
      .font("regular")
      .text("en esta Institución.", { continued: this.hasGrades });
    if (this.hasGrades) this.addGrades();
    this.PDFInstance.fontSize(12);
  }

  addGrades() {
    // let pageWidthWithMargin = this.PDFInstance.options.size[0] - (this.PDFInstance.x * 2)
    let colMarginX = this.PDFInstance.x;
    let tableHeaders = [
      {
        id: "courseName",
        header: "Materia",
        width: 0.83,
        renderer: (tb, data, draw, column, pos) => {
          // Change the font size depending on the amount of grades from the student
          tb.pdf.fontSize(this.student.grades.length > 15 ? 6 : 12);
          return data.courseName;
        },
      },
      { id: "grade", header: "Calificación", width: 0.17, align: "center" },
    ];

    // Set the width accoriding to the page's size
    tableHeaders = tableHeaders.map((h) => ({
      ...h,
      width: this.pageWidthWithMargin * h.width,
    }));

    this.createTable(tableHeaders, {
      headerBorder: ["T", "R", "B", "L"],
      cellBorder: ["T", "R", "B", "L"],
      headerPadding: [5, 5, 5, 5],
      padding: [1.2, 1.2, 1.2, 1.2],
    });
    this.PDFInstance.text("Y ha cursado las siguientes materias: ");
    this.PDFInstance.moveDown(0.5);
    this.tableDocument.addBody(
      this.student.grades.map(({ grade, course: courseName }) => ({
        grade,
        courseName,
      }))
    );
    // Set the cursor at the beaginnig of the page
    this.PDFInstance.x = colMarginX;
    // Put extracurricular courses when it's needed
    if (this.student.extraGrades.length > 0) {
      let firstExtraGrade = this.student.extraGrades.shift();
      tableHeaders = [
        {
          id: "courseName",
          header: firstExtraGrade.ext_cou_name,
          width: 0.83,
          renderer: (tb, data, draw, column, pos) => {
            // Change the font size depending on the amount of grades from the student
            tb.pdf.fontSize(this.student.extraGrades.length > 15 ? 6 : 12);
            return data.extracurricular_courses;
          },
        },
        {
          id: "grade",
          header: firstExtraGrade.grade,
          width: 0.17,
          align: "center",
        },
      ];
      tableHeaders = tableHeaders.map((h) => ({
        ...h,
        width: this.pageWidthWithMargin * h.width,
      }));
      // Extracurricular courses hearder config
      let tableExtraGradesHeader = [
        {
          id: "extra_grades",
          header: "Curos extracurriculares",
          width: 1,
          renderer: (tb, data, draw, column, pos) => {
            // Change the font size depending on the amount of grades from the student
            tb.pdf.fontSize(this.student.grades.length > 15 ? 6 : 12);
            return data.extracurricular_courses;
          },
        },
      ];
      tableExtraGradesHeader = tableExtraGradesHeader.map((h) => ({
        ...h,
        width: this.pageWidthWithMargin * h.width,
      }));
      // Draw Extracurricular courses hearder
      this.createTable(tableExtraGradesHeader, {
        headerBorder: ["T", "R", "B", "L"],
        cellBorder: ["T", "R", "B", "L"],
        headerPadding: [5, 5, 5, 5],
        padding: [1.2, 1.2, 1.2, 1.2],
      });
      this.PDFInstance.fontSize(this.student.extraGrades.length > 15 ? 6 : 12);
      this.tableDocument.addBody([]);
      // Set the cursor at the beaginnig of the page
      // Draw Extracurricular courses grades
      this.PDFInstance.fontSize(this.student.grades.length > 15 ? 6 : 12);
      this.PDFInstance.x = colMarginX;
      this.createTable(tableHeaders, {
        headerBorder: ["T", "R", "B", "L"],
        cellBorder: ["T", "R", "B", "L"],
        headerPadding: [1.2, 1.2, 1.2, 1.2],
        padding: [1.2, 1.2, 1.2, 1.2],
      });
      this.tableDocument.addBody(
        this.student.extraGrades.map(({ grade, ext_cou_name: courseName }) => ({
          grade,
          courseName,
        }))
      );
    }
  }

  writeExpeditionDate() {
    this.PDFInstance.text("", this.marginDocument, this.PDFInstance.y);
    this.PDFInstance.moveDown(this.student.grades.length < 16 ? 2 : 0.4);
    this.PDFInstance.text(
      `Se extiende la presente a solicitud de ${
        this.student.gender == "F" ? "la interesada" : "el interesado"
      } en la ciudad de Durango, Dgo., a los ${this.dateDay} días del mes de ${
        this.dateMonth
      } de ${this.dateYear}. `,
      this.marginXDocument,
      this.PDFInstance.y,
      { align: "left" }
    );
    if (!this.hasGrades) {
      this.PDFInstance.y =
        this.PDFInstance.options.size[0] - this.marginYDocument;
    } else {
      this.PDFInstance.moveDown(this.student.grades.length < 16 ? 5 : 0.5);
    }
  }
}

module.exports = ProofOfStudies;
