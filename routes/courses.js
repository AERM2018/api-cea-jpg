const { Router } = require("express");
const { check, param } = require("express-validator");
const { validateFields } = require("../middlewares/validateFields");

const {
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/coursesController");
const validateJWT = require("../middlewares/validar-jwt");
const {
  checkCourseExistence,
  isValidRestrictionCourseOrExtraCourse,
} = require("../middlewares/dbValidations");

const coursesRouter = Router();

coursesRouter.get("/", [validateJWT], getAllCourses);

coursesRouter.post(
  "/",
  [
    validateJWT,
    check(
      "id_major",
      "El id de major es obligatorio y debe ser un numero entero"
    )
      .isNumeric()
      .exists({ checkNull: true }),
    check(
      "restricted_by_course",
      "El id del curso que restringe al curso por crear debe ser un numero entero"
    )
      .exists({ checkNull: false })
      .custom((restricted_by_course) =>
        isValidRestrictionCourseOrExtraCourse(restricted_by_course)
      ),
    check(
      "restricted_by_extracourse",
      "El id del curso extracurricular que restringe al curso por crear debe ser un numero entero"
    )
      .exists({ checkNull: false })
      .custom((restricted_by_course) =>
        isValidRestrictionCourseOrExtraCourse(restricted_by_course)
      ),
    check(
      "course_name",
      "El nombre del curso es obligatorio y debe tener como máximo 70 caracteres"
    )
      .not()
      .isEmpty()
      .isLength({ max: 70 }),
    validateFields,
    checkCourseExistence,
  ],
  createCourse
);

coursesRouter.post("/restrictions", [
  validateJWT,
  check("restricted_course", "The course to be restricted is required").exists({
    checkNull: false,
  }),
  check(
    "restricted_extracourse",
    "The extracurricular course to be restricted is required"
  ).exists({ checkNull: false }),
  check(
    "mandatory_course",
    "The course which is mandatory to restrict other course is required"
  ).exists({ checkNull: false }),
  check(
    "restricted_course",
    "The extracurricular course which is mandatory to restrict other course is required"
  ).exists({ checkNull: false }),
  validateFields,
]);

coursesRouter.put(
  "/:id",
  [
    param(
      "id",
      "El id del curso es obligatorio y debe de ser un numero"
    ).isNumeric(),
    check(
      "id_major",
      "El id de major es obligatorio y debe ser un numero entero"
    )
      .isNumeric()
      .exists({ checkNull: true }),
    check(
      "course_name",
      "El nombre del curso es obligatorio y debe tener como máximo 70 caracteres"
    )
      .not()
      .isEmpty()
      .isLength({ max: 70 }),
    validateFields,
    validateJWT,
  ],
  updateCourse
);

coursesRouter.delete(
  "/:id",
  [
    param(
      "id",
      "El id del curso es obligatorio y debe de ser un numero"
    ).isNumeric(),
    validateJWT,
  ],
  deleteCourse
);

module.exports = coursesRouter;
