const { Router } = require("express");
const { check, param } = require("express-validator");
const {
  takeCourseAssistance,
  deleteAssistence,
  updateAssitence,
  getAllAssistance,
  takeExtracurCourAssistance,
  takeGraSecAssistance,
  getAllAssistanceByStudent,
  getExtrCourAssistance,
  getGraSecAssistance,
  getCourseAssistance,
  getExtraCurricularCourseAssistanceDays,
  getGraduationCourseAssistanceDays,
  getCourseAssistanceDays,
} = require("../controllers/assitsController");
const {
  checkExtraCurCourExistence,
  checkGraSecExistence,
  checkCourseExistence,
  checkAssitExistence,
  checkGroupCourseExistence,
  checkGraduationCourseExistence,
} = require("../middlewares/dbValidations");
const validateJWT = require("../middlewares/validar-jwt");
const { validateFields } = require("../middlewares/validateFields");

const assitsRouter = Router();

assitsRouter.get(
  "/students/:id_student",
  [validateJWT],
  getAllAssistanceByStudent
);

assitsRouter.get("/", [validateFields, validateJWT], getAllAssistance);

assitsRouter.get(
  "/regular/:id_gro_cou",
  [
    check("id_gro_cou", "El id del curso grupo es numero y es obligatorio.")
      .isNumeric()
      .notEmpty(),
    validateFields,
    checkGroupCourseExistence,
    validateJWT,
  ],
  getCourseAssistance
);

// Traer días de asistencia de curso normal
assitsRouter.get(
  "/regular/:id_gro_cou/assistance_days",
  [
    check("id_gro_cou", "El id del curso grupo es numero y es obligatorio.")
      .isNumeric()
      .notEmpty(),
    validateFields,
    checkGroupCourseExistence,
    validateJWT,
  ],
  getCourseAssistanceDays
);

assitsRouter.get(
  "/extracurricular/:id_ext_cou",
  [
    check(
      "id_ext_cou",
      "El id del curso extracurricular es numero y es obligatorio."
    )
      .isNumeric()
      .notEmpty(),
    validateFields,
    checkExtraCurCourExistence,
    validateJWT,
  ],
  getExtrCourAssistance
);
//  Traer días de asistencia de cursos extra
assitsRouter.get(
  "/extracurricular/:id_ext_cou/assistance_days",
  [
    check(
      "id_ext_cou",
      "El id del curso extracurricular es numero y es obligatorio."
    )
      .isNumeric()
      .notEmpty(),
    validateFields,
    checkExtraCurCourExistence,
    validateJWT,
  ],
  getExtraCurricularCourseAssistanceDays
);
assitsRouter.get(
  "/graduation/:id_graduation_course/assistance_days",
  [
    check(
      "id_graduation_course",
      "El id del curso de graduación es numero y es obligatorio."
    )
      .isNumeric()
      .notEmpty(),
    validateFields,
    checkGraduationCourseExistence,
    validateJWT,
  ],
  getGraduationCourseAssistanceDays
);

assitsRouter.post(
  "/regular/:id_gro_cou",

  [
    check("id_gro_cou", "El id del curso grupo es numero y es obligatorio.")
      .isNumeric()
      .notEmpty(),
    check("date_assistance", "La fecha de la asistencia es obligatorio")
      .isDate()
      .notEmpty(),
    validateFields,
    checkGroupCourseExistence,
    validateJWT,
  ],
  takeCourseAssistance
);

assitsRouter.post(
  "/extracurricular/:id_ext_cou",
  [
    check("id_ext_cou", "id_ext_cou de tipo integer, campo obligatorio")
      .isInt()
      .notEmpty(),
    check("date_assistance", "La fecha de la asistencia es obligatorio")
      .isDate()
      .notEmpty(),
    checkExtraCurCourExistence,
    validateFields,
    validateJWT,
  ],
  takeExtracurCourAssistance
);

assitsRouter.post(
  "/graduation/:id_graduation_section",
  [
    check(
      "id_graduation_section",
      "id_graduation_section de tipo integer, campo obligatorio"
    )
      .isInt()
      .notEmpty(),
    check("date_assistance", "La fecha de la asistencia es obligatorio")
      .isDate()
      .notEmpty(),
    checkGraSecExistence,
    validateFields,
    validateJWT,
  ],
  takeGraSecAssistance
);

assitsRouter.put(
  "/:id_assistance",
  [
    param("id_assistance", "Campo de tipo integer, obligatorio")
      .not()
      .isEmpty()
      .isInt(),
    check(
      "attended",
      "Campo de tipo tinyint, obligatorio. 0=Falta, 1=Asistencia, 2=Falta justificada"
    )
      .isNumeric()
      .notEmpty(),
    validateFields,
    validateJWT,
  ],
  updateAssitence
);

assitsRouter.delete(
  "/:id_assistance",
  [
    check(
      "id_assistance",
      "El id es un número entero y es obligatorio"
    ).isNumeric(),
    validateFields,
    checkAssitExistence,
    validateJWT,
  ],
  deleteAssistence
);

module.exports = assitsRouter;
