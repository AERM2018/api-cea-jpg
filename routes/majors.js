const { Router } = require("express");
const { check, param } = require("express-validator");
const {
  getAllMajors,
  deleteMajor,
  updateMajor,
  createMajor,
  getMajorGroupsTrack,
  getMajorGroups,
} = require("../controllers/majorController");
const {
  isValidEduLevel,
  checkMajorExistence,
} = require("../middlewares/dbValidations");
const validateJWT = require("../middlewares/validar-jwt");
const { validateFields } = require("../middlewares/validateFields");

const majorsRouter = Router();

majorsRouter.get("/", [validateJWT], getAllMajors);

majorsRouter.get(
  "/:id_major/groups/courses",
  [
    validateJWT,
    param(
      "id_major",
      "El id de la carrera es obligatorio y debe de ser un numero entero"
    ).isNumeric(),
    validateFields,
    checkMajorExistence,
  ],
  getMajorGroupsTrack
);

majorsRouter.get(
  "/:id_major/groups",
  [
    validateJWT,
    param(
      "id_major",
      "El id de la carrera es obligatorio y debe de ser un numero entero"
    ).isNumeric(),
    validateFields,
    checkMajorExistence,
  ],
  getMajorGroups
);

majorsRouter.post(
  "/",
  [
    check(
      "major_name",
      "El nombre de la carrera es obligatario y tiene que tener como maximo 70 caracteres"
    )
      .not()
      .isEmpty()
      .isLength({ max: 70 }),
    check("edu_level", "El nivel de eduación es numero entero y es obligatorio")
      .isInt()
      .custom(isValidEduLevel),
    validateFields,
    validateJWT,
  ],
  createMajor
);
majorsRouter.put(
  "/:id_major",
  [
    param(
      "id_major",
      "El id de la carrera es obligatorio y debe de ser un numero entero"
    ).isNumeric(),
    check(
      "major_name",
      "El nombre de la carrera es obligatario y tiene que tener como maximo 70 caracteres"
    )
      .not()
      .isEmpty()
      .isLength({ max: 70 }),
    check("id_edu_lev", "El nivel de eduación es obligatorio")
      .notEmpty()
      .custom(isValidEduLevel),
    validateFields,
    validateJWT,
    checkMajorExistence,
  ],
  updateMajor
);

majorsRouter.delete(
  "/:id_major",
  [
    param(
      "id_major",
      "El id de la carrera es obligatorio y debe de ser un numero entero"
    ).isNumeric(),
    validateFields,
    validateJWT,
    checkMajorExistence,
  ],
  deleteMajor
);

module.exports = majorsRouter;
