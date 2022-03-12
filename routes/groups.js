const { Router } = require("express");
const { check, param } = require("express-validator");
const {
  getAllGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  addCourseGroup,
  getStudentsFromGroup,
  removeCourseGroup,
  getCoursesGroupHasTaken,
  getAssistanceDays,
  assignGroupChief,
  removeGroupChief,
} = require("../controllers/groupsController");
const {
  checkGroupExistence,
  checkCourseExistence,
  checkGroupCourseExistence,
  checkMajorExistence,
  checkTeacherExistence,
  checkCampusExistence,
  checkStudentExistence,
  isStudentPartOfAGroup,
} = require("../middlewares/dbValidations");
const { isValidSchedule } = require("../middlewares/schedule");
const validateJWT = require("../middlewares/validar-jwt");
const { validateFields } = require("../middlewares/validateFields");

const groupsRouter = Router();

groupsRouter.get("/", [validateJWT], getAllGroups);

groupsRouter.get("/:id_group/courses", [validateJWT], getCoursesGroupHasTaken);

groupsRouter.post(
  "/",
  [
    check(
      "id_major",
      "El id de la cerrera es obligatorio y tiene que ser un numero entero"
    )
      .notEmpty()
      .isNumeric(),
    check(
      "id_campus",
      "El id del campus es obligatorio y tiene que ser un numero entero"
    )
      .notEmpty()
      .isNumeric(),
    check(
      "group_name",
      "El nombre del grupo es obligaotorio y tiene que tener como maximo 15 caracteres"
    )
      .not()
      .isEmpty()
      .isLength({ max: 15 }),
    check(
      "time_table",
      "Es obligatorio seleccionar por lo menos un dia para el horario"
    ).isArray({ min: 1 }),
    checkMajorExistence,
    checkCampusExistence,
    validateFields,
    validateJWT,
    isValidSchedule,
  ],
  createGroup
);

groupsRouter.put(
  "/:id_group",
  [
    param(
      "id_group",
      "El id del grupo es obligatorio y debe ser un numero entero"
    ).isNumeric(),
    check(
      "id_major",
      "El id de la cerrera es obligatorio y tiene que ser un numero entero"
    )
      .notEmpty()
      .isNumeric(),
    check(
      "id_campus",
      "El id del campus es obligatorio y tiene que ser un numero entero"
    )
      .notEmpty()
      .isNumeric(),
    check(
      "group_name",
      "El nombre del grupo es obligaotorio y tiene que tener como maximo 15 caracteres"
    )
      .not()
      .isEmpty()
      .isLength({ max: 15 }),
    check(
      "time_table",
      "Es obligatorio seleccionar por lo menos un dia para el horario"
    ).isArray({ min: 1 }),
    checkGroupExistence,
    validateFields,
    validateJWT,
  ],
  updateGroup
);

groupsRouter.delete(
  "/:id_group",
  [
    param(
      "id_group",
      "El id del grupo es obligatorio y debe ser un numero entero"
    ).isNumeric(),
    checkGroupExistence,
    validateFields,
    validateJWT,
  ],
  deleteGroup
);

//TODO: Definir start_date and end_date automaticamente dependiendo de los días de clase del grupo
groupsRouter.post(
  "/:id_group/courses/:id_course",
  [
    check("id_teacher", "El id del maestro es es obligatorio."),
    check("start_date", "La fecha de inicio es obligatorio")
      .notEmpty()
      .isDate(),
    check("end_date", "La fecha de fin es obligatorio").notEmpty().isDate(),
    checkTeacherExistence,
    checkCourseExistence,
    checkGroupExistence,
    validateFields,
    validateJWT,
  ],
  addCourseGroup
);

groupsRouter.delete(
  "/:id_group/courses/:id_course",
  [
    check(
      "id_group",
      "El id del grupo es un número y es obligatorio"
    ).isNumeric(),
    check(
      "id_course",
      "El id del curso es un número y es obligatorio"
    ).isNumeric(),
    checkGroupExistence,
    checkCourseExistence,
    checkGroupCourseExistence,
    validateFields,
    validateJWT,
  ],
  removeCourseGroup
);

groupsRouter.get(
  "/:id_group/students",
  [
    check(
      "id_group",
      "El id del grupo es obligatorio y debe de ser un numero entero"
    ).isNumeric(),
    checkGroupExistence,
    validateFields,
    validateJWT,
  ],
  getStudentsFromGroup
);

groupsRouter.patch(
  "/:id_group/student/:matricula",
  [
    check(
      "id_group",
      "El id del grupo es obligatorio y debe de ser un numero entero"
    ).isNumeric(),
    check("matricula", "La matricula del estudiante es obligatoria").notEmpty(),
    checkGroupExistence,
    checkStudentExistence,
    isStudentPartOfAGroup,
    validateFields,
    validateJWT,
  ],
  assignGroupChief
);

groupsRouter.delete(
  "/:id_group/groupChief",
  [
    check(
      "id_group",
      "El id del grupo es obligatorio y debe de ser un numero entero"
    ).isNumeric(),
    checkGroupExistence,
    validateFields,
    validateJWT,
  ],
  removeGroupChief
);

module.exports = groupsRouter;
