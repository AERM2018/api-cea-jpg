const { Router } = require("express");
const { check, param } = require("express-validator");
const {
  getAllGraduationCourses,
  createGraduationCourses,
  updateGraduationCourses,
  deleteGraduationCourses,
  getStudentsFromGradCourse,
  getGraduationCourseAssistanceDays,
} = require("../controllers/graduation_coursesController");
const {
  checkGraduationCourseExistence,
  checkTeacherExistence,
} = require("../middlewares/dbValidations");
const validateJWT = require("../middlewares/validar-jwt");
const { validateFields } = require("../middlewares/validateFields");

const Graduation_courses_Router = Router();

Graduation_courses_Router.get("/", [validateJWT], getAllGraduationCourses);

Graduation_courses_Router.post(
  "/",
  [
    check(
      "course_grad_name",
      "El nombre del curso de graduación es obligatorio"
    )
      .isString()
      .not()
      .isEmpty()
      .isLength({ max: 25 }),
    check("id_teacher", "El id del maestro es obligatorio")
      .isString()
      .notEmpty()
      .isLength({ max: 15 }),
    check(
      "start_date",
      "start_date es campo de tipo DATE con fromato YYYY-MM-DD, es obligatorio"
    )
      .isDate()
      .not()
      .isEmpty(),
    check(
      "end_date",
      "end_date es campo de tipo DATE con fromato YYYY-MM-DD, es obligatorio"
    )
      .isDate()
      .not()
      .isEmpty(),
    checkTeacherExistence,
    validateFields,
    validateJWT,
  ],
  createGraduationCourses
);

Graduation_courses_Router.put(
  "/:id_graduation_course",
  [
    param(
      "id_graduation_course",
      "El id del curso de graduación es obligatorio y es un número"
    )
      .not()
      .isEmpty()
      .isInt(),
    check(
      "course_grad_name",
      "El nombre del curso de graduación es obligatorio y debe de tener máximo 25 caracteres"
    )
      .isString()
      .not()
      .isEmpty()
      .isLength({ max: 25 }),
    check(
      "start_date",
      "La fecha de inicio del curso debe de estar fromato YYYY-MM-DD y es obligatoria"
    )
      .isDate()
      .not()
      .isEmpty(),
    check(
      "end_date",
      "La fecha de fin del curso debe de estar fromato YYYY-MM-DD y es obligatoria"
    )
      .isDate()
      .not()
      .isEmpty(),
    checkGraduationCourseExistence,
    validateFields,
    validateJWT,
  ],
  updateGraduationCourses
);

Graduation_courses_Router.delete(
  "/:id_graduation_course",
  [
    param(
      "id_graduation_course",
      "El id del curso de graduación es obligatorio y es un número"
    )
      .not()
      .isEmpty()
      .isInt(),
    checkGraduationCourseExistence,
    validateFields,
    validateJWT,
  ],
  deleteGraduationCourses
);

Graduation_courses_Router.get(
  "/:id_graduation_course/students",
  [
    param(
      "id_graduation_course",
      "El id del curso de graduación es numero y es obligatorio."
    )
      .isInt()
      .notEmpty(),
    validateFields,
    checkGraduationCourseExistence,
    validateJWT,
  ],
  getStudentsFromGradCourse
);

Graduation_courses_Router.get(
  "/:id_graduation_course/assistance_days",
  [
    validateJWT,
    param(
      "id_graduation_course",
      "El id del curso de graduación es numero y es obligatorio."
    )
      .isInt()
      .notEmpty(),
    validateFields,
    checkGraduationCourseExistence,
  ],
  getGraduationCourseAssistanceDays
);

module.exports = Graduation_courses_Router;
