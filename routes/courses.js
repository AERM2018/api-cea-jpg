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

const coursesRouter = Router();

coursesRouter.get("/", [validateJWT], getAllCourses);

coursesRouter.post(
  "/",
  [
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
