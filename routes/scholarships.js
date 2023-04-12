const { Router } = require("express");
const { check } = require("express-validator");
const {
  getAllScholarships,
  updateScholarship,
  createScholarship,
  deleteScholarship,
} = require("../controllers/scholarshipsController");
const validateJWT = require("../middlewares/validar-jwt");
const { validateFields } = require("../middlewares/validateFields");
const { checkStudentExistence } = require("../middlewares/dbValidations");

const scholarshipRouter = Router();

scholarshipRouter.get("/", [validateJWT], getAllScholarships);

scholarshipRouter.post(
  "/",
  [
    check(
      "matricula",
      "La matricula del estudiante es obligatoria y debe tener como máximo 15 caracteres"
    )
      .notEmpty()
      .isString()
      .isLength({ max: 15 }),
    // check(
    //   "scholarship_name",
    //   "El nombre de la beca es obligatorio y debe tener como máximo 15 caracteres"
    // )
    //   .notEmpty()
    //   .isString()
    //   .isLength({ max: 15 }),
    check(
      "percentage",
      "El porcentaje de la beca es obligatorio y debe ser numero flotante"
    )
      .isFloat()
      .exists({ checkNull: true }),
    check(
      "reason",
      "La razon de la beca es obligatoria y debe tener como máximo 100 caracteres"
    )
      .notEmpty()
      .isString()
      .isLength({ max: 100 }),
    check(
      "observations",
      "La observación de la beca es una cadena de texto y debe tener como máximo 200 caracteres"
    )
      .isString()
      .isLength({ max: 200 }),
    validateFields,
    validateJWT,
    checkStudentExistence,
  ],
  createScholarship
);

scholarshipRouter.put(
  "/:id_scholarship",
  [
    check(
      "id_scholarship",
      "El id de la beca es un numero entero y es obligatorio"
    )
      .notEmpty()
      .exists({ checkNull: true }),
    check(
      "matricula",
      "La matricula del estudiante es obligatoria y debe tener como máximo 15 caracteres"
    )
      .notEmpty()
      .isString()
      .isLength({ max: 15 }),
    check(
      "scholarship_name",
      "El nombre de la beca es obligatorio y debe tener como máximo 15 caracteres"
    )
      .notEmpty()
      .isString()
      .isLength({ max: 15 }),
    check(
      "percentage",
      "El porcentaje de la beca es obligatorio y debe ser numero con decimales"
    )
      .isFloat()
      .exists({ checkNull: true }),
    check(
      "reason",
      "La razon de la beca es obligatoria y debe tener como máximo 100 caracteres"
    )
      .notEmpty()
      .isString()
      .isLength({ max: 100 }),
    check(
      "observations",
      "La observación de la beca es una cadena de texto y debe tener como máximo 200 caracteres"
    )
      .isString()
      .isLength({ max: 200 }),
    validateFields,
    validateJWT,
  ],
  updateScholarship
);

scholarshipRouter.delete(
  "/:id_scholarship",
  [
    check(
      "id_scholarship",
      "El id de la beca es un numero entero y es obligatorio"
    )
      .isNumeric()
      .exists({ checkNull: true }),
    validateFields,
    validateJWT,
  ],
  deleteScholarship
);

module.exports = scholarshipRouter;
// DEDG202103001
