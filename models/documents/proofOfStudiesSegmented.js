const { document_types } = require("../../types/dictionaries");
const { AlePDFDocument } = require("../alePDFDocument");

class ProofOfStudiesSegmented extends AlePDFDocument {
  constructor(student = {}, coursesPerPart) {
    super(student);
    this.coursesPerPart = coursesPerPart;
    this.fillDocument();
    this.writeExpeditionDate();
    this.writeFooter();
    this.writeFooterInfo();
    super.endDocument();
  }

  fillDocument() {
    super.writeHeaderOnlyImg({ y: 35 });
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
      .text("Y ha cursado las siguientes materias: ")
      .moveDown(1);

    this.PDFInstance.x = this.marginXDocument;
    this.addGrades();
  }

  splitGrades(coursesPerPart = 4) {
    let part = 1;
    const partNames = [
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
    const partDenomination = [
      { num: 4, name: "Cuatrimestre" },
      { num: 6, name: "Semestre" },
    ];
    let gradesInParts = [];
    let gradesInPart = { grades: [], average: 0 };
    this.student.grades.forEach(({ grade, course }, index) => {
      gradesInPart.grades = [...gradesInPart.grades, { course, grade }]; // Insert grades of the quarter
      gradesInPart.average = gradesInPart.average + parseFloat(grade); // Make the sum of the grades when they're being added
      if (
        index + 1 === coursesPerPart * part ||
        index + 1 === this.student.grades.length
      ) {
        // Insert quarter into the array when I accomulate the number of courses per quarter
        // Or when the num of courses left is less than the courses per quarter
        gradesInPart.quarterName = `${partNames[part - 1]} ${
          partDenomination.find(
            (denomination) => denomination.num === coursesPerPart
          ).name
        }`;
        if (gradesInPart.grades.length < coursesPerPart) {
          gradesInPart.average /= gradesInPart.grades.length;
          while (gradesInPart.grades.length < coursesPerPart) {
            // Fill with  blank spaces the num of courses missing to complete the num needed
            gradesInPart.grades.push({ course: "\n", grade: "\n" });
          }
        } else {
          gradesInPart.average /= coursesPerPart;
        }
        gradesInPart.average = parseFloat(gradesInPart.average.toFixed(2));
        gradesInParts.push(gradesInPart);
        part++;
        gradesInPart = { grades: [], average: 0 };
      }
    });
    // Add extracurricular courses to the doc
    this.student.extraGrades.forEach(({ grade, ext_cou_name }, index) => {
      gradesInPart.grades = [
        ...gradesInPart.grades,
        { course: ext_cou_name, grade },
      ];
      if (index + 1 === this.student.extraGrades.length) {
        gradesInPart.quarterName = `Cursos extracurriculares`;
        gradesInParts.push(gradesInPart);
      }
    });
    return { gradesInParts: gradesInParts, numOfParts: part };
  }

  addGrades() {
    let colMarginX = this.PDFInstance.x;
    let initColMarginY = this.PDFInstance.y;
    let maxColMarginY = 0;
    let col = 0;
    let maxGrades;
    const { gradesInParts, numOfParts } = this.splitGrades(this.coursesPerPart);
    this.student.grades = gradesInParts;
    let tableHeadersGrades = [
      {
        id: "courseName",
        header: "Materia",
        width: numOfParts > 6 ? 0.45 : 0.85,
        renderer: (tb, data, draw, column, pos) => {
          // Change the font size depending on the amount of grades from the student
          tb.pdf.fontSize(7);
          return data.courseName;
        },
      },
      {
        id: "grade",
        header: numOfParts > 6 ? "Cal." : "Calificación",
        width: numOfParts > 6 ? 0.05 : 0.15,
        align: "center",
      },
    ];
    tableHeadersGrades = tableHeadersGrades.map((h) => ({
      ...h,
      width: this.pageWidthWithMargin * h.width,
    }));

    while (this.student.grades.length > 0) {
      col++;
      if (col > 2) {
        this.PDFInstance.addPage();
        this.PDFInstance.y = this.marginYDocument;
        this.maxColMarginY = 0;
        col = 0;
        continue;
      }

      // Adjust the pointer to start drawing the table
      colMarginX =
        this.marginXDocument + this.pageWidthWithMargin * 0.5 * (col - 1);
      this.PDFInstance.y = initColMarginY;
      while (true) {
        const quarter = this.student.grades.shift();
        if (!quarter) break;
        if (quarter.quarterName != "Cursos extracurriculares")
          quarter.grades.push({ course: "PROMEDIO", grade: quarter.average }); // Add quarter average as another course
        this.PDFInstance.x = colMarginX;
        this.PDFInstance.fontSize(8).font("regular-bold");
        let tableHeadersQuarter = [
          {
            id: "quarterName",
            header: quarter.quarterName,
            width: numOfParts > 6 ? 0.5 : 1,
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
        this.PDFInstance.fontSize(7).font("regular");
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
        if (this.PDFInstance.y > maxColMarginY) {
          maxColMarginY = this.PDFInstance.y;
        }
        // Insert new column when the space left is less than 150 px
        // The num of pixels can change in other scenarios
        if (
          this.PDFInstance.options.size[1] -
            this.marginYDocument -
            this.PDFInstance.y <=
          150
        ) {
          break;
        }
      }
    }
    // Set the pointer at the end of the table of the grades and adjust the font size
    this.PDFInstance.y = maxColMarginY;
    this.PDFInstance.fontSize(12);
    if (numOfParts <= 5) this.PDFInstance.moveDown(3);
  }

  writeExpeditionDate() {
    this.PDFInstance.text("", this.marginDocument, this.PDFInstance.y);
    this.PDFInstance.moveDown(1);
    this.PDFInstance.text(
      `Se extiende la presente a solicitud del interesado en la ciudad de Durango, Dgo., a los ${this.dateDay} días del mes de ${this.dateMonth} de ${this.dateYear}. `,
      this.marginXDocument,
      this.PDFInstance.y,
      { align: "left" }
    );
    this.PDFInstance.moveDown(1);
  }

  writeFooterInfo() {
    this.PDFInstance.rect(
      this.marginXDocument,
      this.PDFInstance.options.size[1] - 43,
      this.PDFInstance.options.size[0] - this.PDFInstance.x * 2,
      0.05
    )
      .stroke('gray')
      .moveDown(0.4);
    this.PDFInstance.fontSize(9)
    .fillColor("gray")
      .text(
        "Ayuntamiento No. 618 Nte, Durango,Dgo.",
        this.marginXDocument,
        this.PDFInstance.options.size[1] - 40,
        {
          lineBreak: false,
        }
      )
      .text(
        "Tel (618) 8 11 75 06",
        this.PDFInstance.options.size[0] - this.marginXDocument - 100,
        this.PDFInstance.options.size[1] - 40,
        {
          lineBreak: false,
        }
      )
      .fillColor("gray");
  }
}
module.exports = ProofOfStudiesSegmented;
