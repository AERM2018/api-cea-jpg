const { Router } = require("express");
const { check, param } = require("express-validator");
const {
  uploadGrades,
  updateGrades,
  deleteGradeByStudentId,
  getAllGradesByGroup,
  getAllGroupsGrades,
  getAllGrades,
  getAllGradesByMatricula,
  uploadCourseGrades,
  uploadTesineGrade,
  uploadExtraCurCourGrades,
  updateExtraCurCourGrades,
  updateTesineGrades,
  getAllGradesByCourse,
  getExtraCourseGrades,
  getGraduationSectionGrades,
  getGraduationCourseGrades,
  updateGradeByTest,
  deleteGrade,
} = require("../controllers/gradesController");
const {
  checkStudentExistence,
  checkGradeCourseExistence,
  checkGradeTesineExistence,
  checkStuExtraCouExistence,
  checkExtraCurCourExistence,
  checkGroupExistence,
  checkCourseExistence,
  checkGroupCourseExistence,
  isAllowedToUploadGrades,
  isItPermitted,
  checkRoles,
  checkGraduationCourseExistence,
  isUserAllowedToUpdateGrade,
} = require("../middlewares/dbValidations");
const checkGradeOrGrades = require("../middlewares/grades");
const validateJWT = require("../middlewares/validar-jwt");
const { validateFields } = require("../middlewares/validateFields");

const gradesRouter = Router();

// FIXME: Arreglar error de roles en produción
gradesRouter.get(
  "/all",
  [
    validateJWT,
    // checkRoles([1,2]),
    validateFields,
  ],
  getAllGrades
);

gradesRouter.get(
  "/students/:matricula",
  [
    check(
      "matricula",
      "La matricula del estudiante es una cadena de texto y es obligatorio"
    )
      .isString()
      .isLength({ max: 15 }),
    checkStudentExistence,
    validateFields,
    validateJWT,
  ],
  getAllGradesByMatricula
);

gradesRouter.get(
  "/regular/:id_course/groups/:id_group",
  [
    check("id_course", "El id del curso es un número entero y es obligatorio")
      .isNumeric()
      .exists({ checkNull: true }),
    check("id_group", "El id del grupo es un número entero y es obligatorio")
      .isNumeric()
      .exists({ checkNull: true }),
    checkGroupExistence,
    checkCourseExistence,
    checkGroupCourseExistence,
    validateFields,
    validateJWT,
  ],
  getAllGradesByCourse
);

gradesRouter.get(
  "/extracurricular_courses/:id_ext_cou",
  [validateFields, validateJWT],
  getExtraCourseGrades
);

// gradesRouter.get(
//   "/graduation_courses/:id_graduation_course",
//   [validateFields, validateJWT, checkGraduationCourseExistence],
//   getGraduationCourseGrades
// );

gradesRouter.post(
  "/regular/:id_course",
  [
    validateJWT,
    check("id_course", "El id del curso es un numero entero y es obligatorio")
      .isNumeric()
      .exists({ checkNull: true }),
    check("id_group", "El id del grupo es obligatorio")
      .isNumeric()
      .exists({ checkNull: true }),
    check("students", "Las calificaciones de los estudiantes son obligatorias")
      .isArray({ min: 1 })
      .customSanitizer((students) => {
        return students.map((student) => ({
          ...student,
          grade: student.grade.toLowerCase() === "np" ? "NP" : student.grade,
        }));
      }),

    validateFields,
    checkGroupCourseExistence,
    isAllowedToUploadGrades,
    checkGradeOrGrades,
  ],
  uploadCourseGrades
);

gradesRouter.post(
  "/:id_ext_cou",
  [
    check(
      "id_ext_cou",
      "El id del curso extracurricular es un numero entero y es obligatorio"
    )
      .isNumeric()
      .exists({ checkNull: true }),
    validateFields,
    checkGradeOrGrades,
    validateJWT,
  ],
  uploadExtraCurCourGrades
);

// gradesRouter.post('/:id', [
//     check('id','El id del curso es un numero entero y es obligatorio').isNumeric().exists({checkNull:true}),
//     check('',"El id del grupo es obligatorio").isNumeric().exists({checkNull:true}),
//     check('',"Las calificaciones de los estudiantes deben estar contenidas en un arreglo").isArray({ min:1 }),
//     validateFields,
//     checkGradeOrGrades,
//     validateJWT
// ], uploadTesineGrade);

gradesRouter.put(
  "/regular/:id_grade",
  [
    validateJWT,
    param("id_grade", "El id de la calificación es un numero y es obligatorio")
      .not()
      .isEmpty()
      .isInt(),
    check("grade", "La calificación es obligatoria")
      .notEmpty()
      .customSanitizer((grade) => {
        return grade.toLowerCase() === "np" ? "NP" : student.grade;
      }),
    validateFields,
    checkGradeCourseExistence,
    isUserAllowedToUpdateGrade,
    checkGradeOrGrades,
  ],
  updateGrades
);

gradesRouter.put(
  "/regular/:id_grade/tests",
  [
    param("id_grade", "El id de la calificación es un numero y es obligatorio")
      .not()
      .isEmpty()
      .isInt(),
    check("grade", "Calificación es de tipo float obligatoria")
      .isFloat()
      .notEmpty(),
    checkGradeCourseExistence,
    validateFields,
    validateJWT,
  ],
  updateGradeByTest
);

gradesRouter.put(
  "/extracurricular_courses/:id_ext_cou/students/:matricula",
  [
    param(
      "id_ext_cou",
      "El id del curso extracurricular es un numero y es obligatorio "
    )
      .not()
      .isEmpty()
      .isInt(),
    param("matricula", "La matricula del estudiante es obligatorio ")
      .not()
      .isEmpty()
      .isInt(),
    check("grade", "Calificación es de tipo float obligatoria")
      .isFloat()
      .notEmpty(),
    checkExtraCurCourExistence,
    checkStudentExistence,
    validateFields,
    validateJWT,
  ],
  updateExtraCurCourGrades
);

gradesRouter.put(
  "/tesine/:id_tesine",
  [
    param("id_tesine", "Llave ").not().isEmpty().isInt(),
    // check('id_course','El id del curso es un numero entero y es obligatorio').isNumeric().exists({checkNull:true}),
    // check('id_group',"El id del grupo es obligatorio").isNumeric().exists({checkNull:true}),
    // check('students',"Las calificaciones de los estudiantes deben estar contenidas en un arreglo").isArray({ min:1 }),
    check("grade", "Calificación es de tipo float obligatoria")
      .isFloat()
      .notEmpty(),
    checkGradeTesineExistence,
    validateFields,
    validateJWT,
  ],
  updateTesineGrades
);

gradesRouter.delete(
  "/:id_course",
  [
    check("id_course", "El id del curso es un numero entero y es obligatorio")
      .isNumeric()
      .exists({ checkNull: true }),
    check(
      "matricula",
      "El id del estudiante es obligatorio y debe tener como máximo 15 caracteres"
    )
      .isString()
      .notEmpty()
      .isLength({ max: 15 }),
    checkStudentExistence,
    validateFields,
    validateJWT,
  ],
  deleteGradeByStudentId
);

gradesRouter.delete(
  "/regular/:id_grade",
  [
    validateJWT,
    check(
      "id_grade",
      "El id de la calificación del curso es obligatorio."
    ).notEmpty(),
    validateFields,
    checkGradeCourseExistence,
  ],
  deleteGrade
);

module.exports = gradesRouter;
