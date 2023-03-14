const moment = require("moment");
const Grades = require("../models/grades");
const { db } = require("../database/connection");
const { QueryTypes, Op, where, fn, col, literal } = require("sequelize");
const { response, request } = require("express");
const Course = require("../models/courses");
const Group = require("../models/group");
const { getGrades } = require("../queries/queries");
const Stu_gro = require("../models/stu_gro");
const Student = require("../models/student");
const { printAndSendError } = require("../helpers/responsesOfReq");
const {
  getGradesStudent,
  getExtraCoursesGradesStudent,
  getTesineGradeStudent,
} = require("../helpers/students");
const { getGroupDaysAndOverdue } = require("../helpers/dates");
const Payment = require("../models/payment");
const Stu_pay = require("../models/stu_pay");
const Stu_extracou = require("../models/stu_extracou");
const Gro_cou = require("../models/gro_cou");
const Tesine = require("../models/tesine");
const Teacher = require("../models/teacher");
const { filterGradesStudent } = require("../helpers/students");
const Stu_gracou = require("../models/stu_gracou");
const Major = require("../models/major");
const Educational_level = require("../models/educational_level");
const {
  getRegularCourseInfo,
  getExtraCourseInfo,
  getGraduationSectionInfo,
  getGraduationCourseInfo,
} = require("../helpers/courses");
const ExtraCurricularCourses = require("../models/extracurricularcourses");
const Test = require("../models/test");
const Stu_info = require("../models/stu_info");
const Gro_cou_ass = require("../models/gro_cou_ass");
const Assit = require("../models/assit");

const getAllGrades = async (req, res = response) => {
  let grades;
  let { q = "", page = 1, offset = 10 } = req.query;
  try {
    q = q.toLowerCase().split(" ").join("");
    let students = await Stu_info.findAll({
      where: {
        id_student: { [Op.in]: literal("(SELECT id_student FROM grades)") },
      },
      attributes: { exclude: ["id"] },
    });
    students = students.map((student) => {
      return {
        id_student: student.id_student,
        matricula: student.matricula,
        student_name: `${student.surname_m} ${student.surname_f} ${student.name}`,
        campus_name: student.campus_name,
        group_name: student.name_group,
        major_name: `${student.educational_level} en ${student.major_name}`,
        q,
      };
    });
    students = await Promise.all(students);
    students = filterGradesStudent(students, q);
    // students = students.filter(
    //   (student, i) =>
    //     i >= (offset - 1) * page - (offset - 1) && i <= (offset - 1) * page
    // );
    grades = [...students];
    res.json({
      ok: true,
      grades,
    });
  } catch (error) {
    printAndSendError;
  }
};

const getAllGradesByCourse = async (req, res = response) => {
  const { id_course, id_group } = req.params;

  try {
    Grades.belongsTo(Course, { foreignKey: "id_course" });
    Course.hasMany(Grades, { foreignKey: "id_course" });

    Grades.belongsTo(Student, { foreignKey: "id_student" });
    Student.hasMany(Grades, { foreignKey: "id_student" });

    Test.belongsTo(Grades, { foreignKey: "id_grade" });
    Grades.hasOne(Test, { foreignKey: "id_grade" });

    Test.belongsTo(Student, { foreignKey: "id_student" });
    Student.hasMany(Test, { foreignKey: "id_student" });

    const gro_cou = await Gro_cou.findOne({
      where: { [Op.and]: [{ id_course }, { id_group }] },
      raw: true,
    });
    let courseInfo = await getRegularCourseInfo({
      id_gro_cou: gro_cou.id_gro_cou,
    });
    let grades = await Test.findAll({
      attributes: {
        exclude: [
          "id_test",
          "id_gro_cou",
          "application_date",
          "assigned_test_date",
          "applied",
        ],
      },
      include: [
        {
          model: Student,
          attributes: [
            "id_student",
            "matricula",
            "surname_m",
            [
              fn(
                "concat",
                col("surname_m"),
                " ",
                col("surname_f"),
                " ",
                col("name")
              ),
              "student_name",
            ],
          ],
        },
        {
          model: Grades,
          attributes: { exclude: ["id_course"] },
        },
      ],
      where: {
        id_gro_cou: gro_cou.id_gro_cou,
        id_student: {
          [Op.in]: literal(
            `(SELECT id_student FROM stu_gro WHERE id_group = ${id_group})`
          ),
        },
      },
      order: [[col("student.surname_m", "DESC")]],
    });
    grades = grades.map((gradeData) => {
      const { student, grade } = gradeData.toJSON();
      return {
        ...grade,
        ...student,
      };
    });
    res.status(200).json({
      ok: true,
      ...courseInfo,
      grades,
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

const getExtraCourseGrades = async (req, res = response) => {
  const { id_ext_cou } = req.params;
  Stu_extracou.belongsTo(Student, { foreignKey: "id_student" });
  Student.hasOne(Stu_extracou, { foreignKey: "id_student" });
  try {
    let courseInfo = await getExtraCourseInfo({ id_ext_cou });
    let grades = await Stu_extracou.findAll({
      include: {
        model: Student,
        attributes: [
          "id_student",
          "matricula",
          [
            fn(
              "concat",
              col("surname_m"),
              " ",
              col("surname_f"),
              " ",
              col("name")
            ),
            "student_name",
          ],
        ],
      },
      where: { id_ext_cou },
      raw: true,
      nest: true,
    });
    grades = grades.map(({ grade, student }) => ({ grade, ...student }));
    res.status(200).json({
      ok: true,
      ...courseInfo[0],
      grades,
    });
  } catch (error) {
    printAndSendError(res, error);
  }
};

// const getGraduationCourseGrades = async (req, res = response) => {
//   const { id_graduation_course } = req.params;
//   try {
//     let graduationCourse = await getGraduationCourseInfo(id_graduation_course);

//     Stu_gracou.belongsTo(Student, { foreignKey: "id_student" });
//     Student.hasOne(Stu_gracou, { foreignKey: "id_student" });
//     Stu_gracou.belongsTo(Tesine, { foreignKey: "id_tesine" });
//     Tesine.hasOne(Stu_gracou, { foreignKey: "id_tesine" });
//     let grades = await Stu_gracou.findAll({
//       include: [
//         {
//           model: Student,
//           attributes: [
//             "id_student",
//             "matricula",
//             [
//               fn(
//                 "concat",
//                 col("name"),
//                 " ",
//                 col("surname_f"),
//                 " ",
//                 col("surname_m")
//               ),
//               "student_name",
//             ],
//           ],
//         },
//         {
//           model: Tesine,
//         },
//       ],
//       where: { id_graduation_course },
//       raw: true,
//       nest: true,
//     });
//     grades = grades.map(({ student, tesine }) => ({ ...student, ...tesine }));
//     return res.json({
//       ok: true,
//       ...graduationCourse,
//       grades,
//     });
//   } catch (error) {
//     printAndSendError(res, error);
//   }
// };
// // It's not working
// const getAllGroupsGrades = async ( req, res =  response)=>{
//     const { edu_level, major, group_name = '',id_group = 0} = req.query

//     const groups = await Group.findAll({
//         where : {
//             // edu_level,
//             // major
//         }
//     })

//     const groupsGrades = groups.map( async({id_group, name_group}) => {
//         let avgGroup = 0;

//         let studentsGroup = await Stu_gro.findAll({
//             where : { id_group },
//             attributes : ['id_student']
//         })

//         studentsGroup = studentsGroup.map( studentGroup => studentGroup.toJSON().id_student)

//         studentsGroup = studentsGroup.map( async(id_student) => {
//             const avgStudent = await getGradesStudent( id_student, true)
//             return {id_student, avg: avgStudent}
//         })

//         const studentsAvgs = await Promise.all(studentsGroup)

//         studentsAvgs.forEach( ({avg}) => {
//             avgGroup += avg
//         })
//         avgGroup /= studentsGroup.length
//         return {
//             id_group,
//             name_group,
//             avg : avgGroup
//         }
//     })

//     Promise.all(groupsGrades).then( grades => {
//         res.json({
//             ok: true,
//             groups : grades
//         })
//     })

// }

// const getAllGradesByGroup = async( req, res = response) => {
//     let {id_group = 0 } = req.params

//     const group = await Group.findOne({
//         where :  {id_group},
//         attributes : ['id_group','name_group']
//     })

//     id_group = (group) ? group.toJSON().id_group : '';
//     Student.hasOne(Stu_gro, {foreignKey : 'id_student'})
//     Stu_gro.belongsTo(Student, {foreignKey : 'id_student'})
//     let studentsGroup = await Stu_gro.findAll({
//         where : {
//             id_group
//         },
//         include: { model : Student, attributes : ['id_student','matricula',[fn('concat',col('name')," ",col('surname_f')," ",col('surname_m')),'fullname']]},
//         attributes : ['id_student']
//     })

//     studentsGroup = studentsGroup.map( studentGroup => {
//         const {student,...restoGroupInfo} = studentGroup.toJSON()
//         return {...student}

//     })

//     studentsGroup = studentsGroup.map( async(student) => {
//         const avgStudent = await getGradesStudent(student.id_student, true)
//         return {...student,avg: avgStudent}
//     })

//     Promise.all(studentsGroup).then( students => {
//         res.json({
//             ok: true,
//             id_group : group.toJSON().id_group,
//             group_name : group.toJSON().name_group,
//             students
//         })
//     })
// }
const searchAverageByStudent = async (req, res = response) => {
  const { name = "" } = req.query;

  try {
    let coincidencesStudents = await Student.findAll({
      attributes: [
        "id_student",
        "matricula",
        [
          fn(
            "concat",
            col("name"),
            " ",
            col("surname_m"),
            " ",
            col("surname_f")
          ),
          "name",
        ],
      ],
      where: {
        [Op.or]: [
          where(fn("concat", col("name"), col("surname_m"), col("surname_f")), {
            [Op.like]: `%${name}%`,
          }),
        ],
      },
    });
    if (coincidencesStudents.length > 0) {
      coincidencesStudents = coincidencesStudents.map(async (student) => {
        const avgStudent = await getGradesStudent(student.toJSON().id_student, {
          onlyAvg: true,
        });
        return { ...student.toJSON(), avgStudent };
      });
      coincidencesStudents = await Promise.all(coincidencesStudents);
    }

    res.json({
      ok: true,
      students: coincidencesStudents,
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

const getAllGradesByMatricula = async (req, res = response) => {
  const { id_student } = req;
  const { page = 1, offset = 10 } = req.query;
  try {
    let grades;
    const { grades: coursesGrades, generalAvg } = await getGradesStudent(
      id_student,
      { withAvg: true }
    );
    const extraCoursesGrades = await getExtraCoursesGradesStudent(id_student);
    const tesineGrade = await getTesineGradeStudent(id_student);
    grades = [...coursesGrades, ...extraCoursesGrades];
    if (tesineGrade) grades.push(tesineGrade);
    grades = grades.filter(
      (grade, i) =>
        i >= (offset - 1) * page - (offset - 1) && i <= (offset - 1) * page
    );
    res.json({
      ok: true,
      grades,
      generalAvg,
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

const uploadCourseGrades = async (req, res = response) => {
  const { id_course } = req.params;
  const { id_group } = req.body;
  let students = req.body.students;
  let except = [];

  try {
    // Check if the course exists
    const course = await Course.findByPk(id_course);
    if (!course) {
      return res.status(404).json({
        ok: false,
        msg: `El curso con id ${id_course} no existe, verifiquelo por favor.`,
      });
    }

    // Check if the group exists
    const group = await Group.findOne({
      where: { id_group: id_group },
    });
    if (!group) {
      return res.status(404).json({
        ok: false,
        msg: `El grupo con id ${id_group} no existe, verifiquelo por favor.`,
      });
    }
    // get ids' of the students which belong to the group
    const stu_gro = await Stu_gro.findAll({
      where: { id_group: id_group },
    });
    const idstudents_group = stu_gro.map((e) => e["id_student"]);
    // Check if there are grades for the course already to avoid duplicates
    const gradesCourse = await Grades.findAll({
      where: {
        id_course: id_course,
        id_student: { [Op.in]: idstudents_group },
      },
    });
    if (gradesCourse.length > 0) {
      return res.status(500).json({
        ok: false,
        msg: `No se ha podido cargar las calificaciones para el grupo con id ${id_group} debido a que ya existen. Si desea modificarlas, actualize las calificaciones`,
      });
    }
    let students_grades = await Promise.all(
      students.map(async (student) => {
        const { id_student } = await Student.findOne({
          where: { matricula: student.matricula },
          attributes: ["id_student"],
        });
        if (!idstudents_group.includes(id_student)) {
          except.push(id_student);
          return {};
        }
        return { ...student, id_student };
      })
    );

    // Check if all the students given belong to the group given

    if (except.length > 0) {
      return res.status(404).json({
        ok: false,
        msg: `No se ha podido subir caliicaciones debido a id(s) no registrados con el grupo con id ${id_group} `,
        "id´s": except,
      });
    }

    // // iterate array to get every student and create his grade voiding dupliactes
    // await Promise.all(
    // students_grades.map(async (grade) => {
    for (const grade of students_grades) {
      try {
        const studentGrade = new Grades({
          id_course,
          id_student: grade.id_student,
          grade: grade.grade,
        });
        await studentGrade.save();
        // const { id_gro_cou } = await Gro_cou.findOne({
        //   where: { [Op.and]: [{ id_group }, { id_course }] },
        // });
        // if (grade.grade !== "NP") {
        //   const { folio: last_folio } = await Test.findOne({
        //     order: [["folio", "desc"]],
        //   });
        //   const testGrade = new Test({
        //     id_student: grade.id_student,
        //     id_gro_cou,
        //     folio: last_folio + 1,
        //     type: "Ordinario",
        //     application_date: moment().format("YYYY-MM-DD"),
        //     assigned_test_date: null,
        //     applied: true,
        //     id_grade: studentGrade.id_grade,
        //   });
        //   await testGrade.save();
        // }
      } catch (err) {
        console.log(err);
      }
    }
    // })
    // );

    res.status(200).json({
      ok: true,
      msg: "Calificaciones cargadas correctamente.",
      except,
    });
  } catch (err) {
    printAndSendError(err);
  }
};

const uploadExtraCurCourGrades = async (req, res) => {
  const { id_ext_cou } = req.params;
  let { students } = req.body;

  try {
    students = students.map(async ({ id_student, grade }) => {
      await Stu_extracou.update(
        { grade },
        { where: { [Op.and]: [{ id_student }, { id_ext_cou }] } }
      );
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

// const uploadTesineGrade = async (req, res) =>{

//     const {id_tesine}=req.params;
//     let  {students}  = req.body;

//     try {
//         students=students.map( async({id_student, grade})=>{

//             await Stu_gracou.update({grade}, {where: {[Op.and]:[{id_student},{id_tesine}]}})
//         })

//     } catch (err) {
//         printAndSendError(res, err)
//     }

// }

const updateGrades = async (req, res = response) => {
  const { id_grade } = req.params;
  const { grade } = req.body;

  try {
    const gradeRef = await Grades.findByPk(id_grade);
    if (["NC"].includes(gradeRef.grade)) {
      return res.status(400).json({
        ok: false,
        msg: "Las calificaciones con valor NC no se pueden actualizar sin antes presentar un exámen.",
      });
    }
    await gradeRef.update({ grade });
    await Test.update(
      {
        applied: true,
        application_date: moment().format("YYYY-MM-DD"),
      },
      { where: { id_grade } }
    );
    res.json({
      ok: true,
      msg: "Calificación de materia corregida correctamente.",
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

const updateGradeByTest = async (req, res = response) => {
  const { id_grade } = req.params;
  const { grade } = req.body;

  try {
    const test = await Test.findOne({
      where: { [Op.and]: [{ id_grade }, { type: "Extraordinario" }] },
    });
    if (!test) {
      return res.status(400).json({
        ok: false,
        msg: "Acutilización de calificación denegada, primero necesita asignar un exámen.",
      });
    }
    // Set date limit to update grade by test (5 days more)
    // if (
    //   moment(test.application_date).diff(moment({}), "days") !== 0 ||
    //   moment(test.application_date).add(5, "days").diff(moment({}), "days") >
    //     6 ||
    //   moment(test.application_date).add(5, "days").diff(moment({}), "days") <
    //     0 ||
    //   test.applied
    // ) {
    //   return res.status(403).json({
    //     ok: false,
    //     msg: "Acutilización de calificación denegada, no está permitido actualizar calificación antes de la fecha indicada.",
    //   });
    // }
    // const testGrade = await Test.findOne({
    //   where: where(
    //     literal(
    //       `(id_grade = ${id_grade} AND (${moment().format(
    //         "YYYY-MM-DD"
    //       )} = ${moment(col("application_date")).format(
    //         "YYYY-MM-DD"
    //       )} OR ${moment().format("YYYY-MM-DD")} <= ${moment(
    //         col("application_date")
    //       )
    //         .add(5, "days")
    //         .format("YYYY-MM-DD")}) AND ${col("applied").col} = 0)`
    //     ),
    //     true
    //   ),
    // });

    await test.update({ applied: true });
    await gradeRef.update({ grade });
    res.json({
      ok: true,
      msg: "Calificación de materia actualizada correctamente.",
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

const updateExtraCurCourGrades = async (req, res) => {
  const { id_ext_cou } = req.params;
  const { id_student } = req;
  const { grade } = req.body;

  try {
    await Stu_extracou.update(
      { grade },
      { where: { [Op.and]: [{ id_ext_cou }, { id_student }] } }
    );

    res.json({
      ok: true,
      msg: "Calificación de curso extra curricular actualizada correctamente.",
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

const updateGraduationCourseGrade = async (req, res) => {
  const { id_graduation_course } = req.params;
  const { grade } = req.body;
  const { id_student } = req;

  try {
    await Stu_gracou.update(
      { grade },
      { where: { [Op.and]: [{ id_student }, { id_graduation_course }] } }
    );

    res.json({
      ok: true,
      msg: "Calificación de curso de gracuación actualizada correctamente.",
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

const deleteGradeByStudentId = async (req, res = response) => {
  const { id_course } = req.params;
  const { id_student } = req;

  try {
    // Check if the course exists
    const course = await Course.findByPk(id_course);
    if (!course) {
      return res.status(404).json({
        ok: false,
        msg: `El curso con id ${id_course} no existe, verifiquelo por favor.`,
      });
    }

    //check if the student has the grade which wants to be deleted
    const grade = await Grades.findOne({
      where: {
        id_course: id_course,
        id_student: id_student,
      },
    });
    if (!grade) {
      return res.status(404).json({
        ok: false,
        msg: `El estudiante con id ${id_student} no cuenta con una calificación para el curso con id ${id_course}, verifiquelo por favor.`,
      });
    }

    const testRelated = await Test.findOne({
      where: { [Op.and]: { id_grade: grade.id_grade, id_student } },
    });
    if (testRelated) {
      await testRelated.destroy();
    }
    await grade.destroy();

    res.status(200).json({
      ok: true,
      msg: `Calificación del estudiante con id ${id_student} eliminada correctamente`,
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

const deleteGrade = async (req, res) => {
  const { id_grade } = req.params;
  try {
    try {
      await db.transaction(async (t) => {
        const test = await Test.findOne({
          where: { id_grade },
          transaction: t,
        });
        const grade = await Grades.findByPk(id_grade, { transaction: t });
        const { id_gro_cou } = test;
        const { id_student } = grade;
        await test.destroy({ transaction: t });
        await grade.destroy({ transaction: t });
        const assistences = await Gro_cou_ass.findAll({
          where: { id_gro_cou, id_student },
          transaction: t,
        });
        const assistence_ids = assistences.map(
          (assistence) => assistence.id_assistance
        );
        await Promise.all(
          assistences.map(async (assistance) => {
            await assistance.destroy({ transaction: t });
          })
        );
        await Assit.destroy({
          where: { id_assistance: { [Op.in]: assistence_ids } },
          transaction: t,
        });
      });
      res.json({
        ok: true,
        msg: "Califcación del curso eliminada correctamente.",
      });
    } catch (error) {
      console.log(error);
      res.json({
        ok: false,
        msg: "Ocurrio un error al tratar de eliminar la calificación del curso.",
      });
    }
  } catch (error) {
    printAndSendError(res, error);
  }
};
module.exports = {
  getAllGradesByCourse,
  getExtraCourseGrades,
  uploadCourseGrades,
  updateGrades,
  updateGradeByTest,
  deleteGradeByStudentId,
  searchAverageByStudent,
  // getAllGroupsGrades,
  // getAllGradesByGroup,
  getAllGrades,
  getAllGradesByMatricula,
  updateExtraCurCourGrades,
  updateGraduationCourseGrade,
  uploadExtraCurCourGrades,
  // uploadTesineGrade
  deleteGrade,
};
