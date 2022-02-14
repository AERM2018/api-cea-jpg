const { Router } = require("express");
const { check, param } = require("express-validator");
const {
  getAllExtraCurricularCourses,
  createExtraCurricularCourse,
  updateExtraCurricularCourse,
  deleteExtraCurricularCourse,
  getStudentsFromExtraCourse,
  getStudentFromExtraCour,
  StudentFromExtraCour,
  getExtraCurricularCourseAssistanceDays,
} = require("../controllers/extracurricularcoursesController");
const {
  checkMajorExistence,
  checkTeacherExistence,
  checkExtraCurCourExistence,
} = require("../middlewares/dbValidations");
const validateJWT = require("../middlewares/validar-jwt");
const { validateFields } = require("../middlewares/validateFields");

const extraCurricularCoursesRouter = Router();

extraCurricularCoursesRouter.get(
  "/",
  [validateJWT],
  getAllExtraCurricularCourses
);

extraCurricularCoursesRouter.get(
  "/:id_ext_cou/students",
  [
    validateJWT,
    check(
      "id_ext_cou",
      "El id del curso extracurricular es obligatorio y es número"
    )
      .notEmpty()
      .isNumeric(),
    validateFields,
    checkExtraCurCourExistence,
  ],
  getStudentsFromExtraCourse
);

extraCurricularCoursesRouter.post(
  "/",
  [
    check("id_major", "El id de la carrera es obligatorio y es un número.")
      .isInt()
      .not()
      .isEmpty(),
    check(
      "ext_cou_name",
      "El nombre de curso extracurricular es obligatorio y tiene como máximo de 15 carácteres."
    )
      .isString()
      .not()
      .isEmpty()
      .isLength({ max: 15 }),
    check(
      "start_date",
      "La fecha de inicio del curso debe de ser en fromato YYYY-MM-DD y es obligatoria."
    )
      .isDate()
      .not()
      .isEmpty(),
    check("limit_participants", "El limíte de participantes es obligatorios")
      .isNumeric()
      .not()
      .isEmpty(),
    check("cost", "El costo del curso es obligatorio.")
      .isFloat()
      .not()
      .isEmpty(),
    check("id_teacher", "El id del maestro es obligatorio.")
      .isString()
      .not()
      .isEmpty()
      .isLength({ max: 30 }),
    checkMajorExistence,
    checkTeacherExistence,
    validateFields,
    validateJWT,
  ],
  createExtraCurricularCourse
);

extraCurricularCoursesRouter.put(
  "/:id_ext_cou",
  [
    validateJWT,
    param(
      "id_ext_cou",
      "El id del curso extracurricular es obligatorio y es un número."
    )
      .not()
      .isEmpty()
      .isInt(),
    check("id_major", "El id de la carrera es obligatorio y es un número.")
      .isInt()
      .not()
      .isEmpty(),
    check(
      "ext_cou_name",
      "El nombre de curso extracurricular es obligatorio y tiene como máximo de 15 carácteres."
    )
      .isString()
      .not()
      .isEmpty()
      .isLength({ max: 15 }),
    check(
      "start_date",
      "La fecha de inicio del curso debe de ser en fromato YYYY-MM-DD y es obligatoria."
    )
      .isDate()
      .not()
      .isEmpty(),
    check(
      "end_date",
      "La fecha de fin del curso debe de ser en fromato YYYY-MM-DD y es obligatoria."
    )
      .isDate()
      .not()
      .isEmpty(),
    check("limit_participants", "El limíte de participantes es obligatorios")
      .isNumeric()
      .not()
      .isEmpty(),
    check("cost", "El costo del curso es obligatorio.")
      .isFloat()
      .not()
      .isEmpty(),
    check("id_teacher", "El id del maestro es obligatorio.")
      .isString()
      .not()
      .isEmpty()
      .isLength({ max: 30 }),
    validateFields,
    checkExtraCurCourExistence,
    checkMajorExistence,
    checkTeacherExistence,
  ],
  updateExtraCurricularCourse
);

extraCurricularCoursesRouter.delete(
  "/:id_ext_cou",
  [
    param("id_ext_cou", "id_ext_cou es llave primaria de tipo integer").isInt(),
    validateJWT,
  ],
  deleteExtraCurricularCourse
);

module.exports = extraCurricularCoursesRouter;
