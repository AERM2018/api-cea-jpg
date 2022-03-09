const { Router } = require("express");
const { check, param } = require("express-validator");
const {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentByMatricula,
  moveStudentFromGroup,
} = require("../controllers/studentController");
const {
  checkStudentExistence,
  checkGroupExistence,
} = require("../middlewares/dbValidations");
const validateJWT = require("../middlewares/validar-jwt");
const { validateFields } = require("../middlewares/validateFields");

const studentsRouter = Router();

studentsRouter.get("/", [validateJWT], getAllStudents);

studentsRouter.get(
  "/:matricula",
  [
    check(
      "matricula",
      "La matricula del estudiante es obligatoria."
    ).notEmpty(),
    validateFields,
    validateJWT,
    checkStudentExistence,
  ],
  getStudentByMatricula
);

studentsRouter.post(
  "/",
  [
    check("email", "El email es obligatorio").notEmpty().isEmail(),
    // check("matricula", "La matricula del estudiante es obligatoria")
    //   .not()
    //   .isEmpty()
    //   .isLength({ max: 15 }),
    check(
      "name",
      "El nombre del estudiante es obligatorio y debe de tener como maximo 35 caracteres"
    )
      .not()
      .isEmpty()
      .isLength({ max: 35 }),
    check(
      "surname_f",
      "El apellido paterno es obligatorio y debe de tener como maximo 45 caracteres"
    )
      .not()
      .isEmpty()
      .isLength({ max: 45 }),
    check(
      "surname_m",
      "El apellido materno es obligatorio y debe de tener como maximo 45 caracteres"
    )
      .not()
      .isEmpty()
      .isLength({ max: 45 }),
    check("group_chief", "El campo de jefe de grupo es obligatorio")
      .notEmpty()
      .isBoolean(),
    check(
      "curp",
      "El CURP es obligatorio y tiene que tener como maximo 18 caracteres"
    )
      .not()
      .isEmpty()
      .isLength({ max: 18 }),
    check(
      "mobile_number",
      "El numero de telefono es obligatorio y tienen que ser 10 digitos"
    )
      .not()
      .isEmpty()
      .isLength({ max: 10 }),
    check(
      "birthdate",
      "La fecha de nacimiento del estudiante es obligatoria"
    ).isDate(),
    check(
      "street",
      "La calle es obligatoria y tiene como maximo 100 caracteres"
    )
      .not()
      .isEmpty()
      .isLength({ max: 100 }),
    check(
      "zip",
      "El codigo postal de la direccion es obligatorio y tiene como maximo 6 caracteres"
    )
      .not()
      .isEmpty()
      .isLength({ max: 6 }),
    check(
      "colony",
      "La colonia es obligatoria y tiene como maximo 30 caracteres"
    )
      .not()
      .isEmpty()
      .isLength({ max: 30 }),
    check(
      "id_group",
      "El grupo al cual va a pertenecer el alumno es obligatorio"
    )
      .isInt()
      .exists({ checkNull: true }),
    check("id_campus", "El campus donde es incrito el alumno es obligatorio")
      .isInt()
      .exists({ checkNull: true }),
    check(
      "birthplace",
      "El lugar de nacimiento es obligatorio y tiene que tener 50 caracteres como maximo"
    )
      .not()
      .isEmpty()
      .isLength({ max: 50 }),
    validateFields,
    validateJWT,
  ],
  createStudent
);

studentsRouter.put(
  "/:id",
  [
    param(
      "id",
      "El id es obligatorio y tiene que ser la matricula de un alumno"
    )
      .notEmpty()
      .isString(),
    check("matricula", "La matricula del estudiante es obligatoria")
      .not()
      .isEmpty()
      .isLength({ max: 15 }),
    check(
      "name",
      "El nombre del estudiante es obligatorio y debe de tener como maximo 35 caracteres"
    )
      .not()
      .isEmpty()
      .isLength({ max: 35 }),
    check(
      "surname_f",
      "El apellido paterno es obligatorio y debe de tener como maximo 45 caracteres"
    )
      .not()
      .isEmpty()
      .isLength({ max: 45 }),
    check(
      "surname_m",
      "El apellido materno es obligatorio y debe de tener como maximo 45 caracteres"
    )
      .not()
      .isEmpty()
      .isLength({ max: 45 }),
    check("group_chief", "El campo de jefe de grupo se tiene que llenar")
      .notEmpty()
      .isBoolean(),
    check(
      "birthdate",
      "La fecha de nacimiento del estudiante es obligatoria"
    ).isDate(),
    check(
      "curp",
      "El CURP es obligatorio y tiene que tener como maximo 18 caracteres"
    )
      .not()
      .isEmpty()
      .isLength({ max: 18 }),
    check(
      "mobile_number",
      "El numero de telefono es obligatorio y tienen que ser 10 digitos"
    )
      .not()
      .isEmpty()
      .isLength({ max: 10 }),
    check(
      "street",
      "La calle es obligatoria y tiene como maximo 100 caracteres"
    )
      .not()
      .isEmpty()
      .isLength({ max: 100 }),
    check(
      "zip",
      "El codigo postal de la direccion es obligatorio y tiene como maximo 6 caracteres"
    )
      .not()
      .isEmpty()
      .isLength({ max: 6 }),
    check(
      "colony",
      "La colonia es obligatoria y tiene como maximo 30 caracteres"
    )
      .not()
      .isEmpty()
      .isLength({ max: 30 }),
    check(
      "birthplace",
      "El lugar de nacimiento es obligatorio y tiene que tener 50 caracteres como maximo"
    )
      .not()
      .isEmpty()
      .isLength({ max: 50 }),
    check("email", "El email es obligatorio").notEmpty().isEmail(),
    //check('address','El domicilio es obligatorio y tiene que tener 50 caracteres como maximo').not().isEmpty().isLength({max:50}),

    // check('complete_documents','Falta el campo de los documentos del alumno').isInt().exists({checkNull:true}),
    validateFields,
    validateJWT,
  ],
  updateStudent
);

studentsRouter.put(
  "/:matricula/groups/:id_group",
  [
    check("matricula", "La matricula del estudiante es obligatoria.")
      .isNumeric()
      .notEmpty(),
    check("id_group", "El id del grupo es un número entero y es obligatorio.")
      .isNumeric()
      .notEmpty(),
    checkStudentExistence,
    checkGroupExistence,
  ],
  moveStudentFromGroup
);

studentsRouter.delete(
  "/:id",
  [
    param(
      "id",
      "El id es obligatorio y tiene que ser la matricula de un alumno"
    )
      .notEmpty()
      .isString(),
    validateFields,
    validateJWT,
  ],
  deleteStudent
);

module.exports = studentsRouter;
