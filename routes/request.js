const { Router, request } = require("express");
const { check, param } = require("express-validator");
const {
  createRequest,
  getAllTheRequests,
  completeARequest,
  deleteRequest,
  getRequestsFromStudent,
} = require("../controllers/requestController");
const {
  checkDepartmentExistence,
  checkStudentExistence,
  checkRequestExistance,
  isValidDocument,
  isValidDocumentType,
} = require("../middlewares/dbValidations");
const { getIdStudent } = require("../middlewares/getIds");
const validateJWT = require("../middlewares/validar-jwt");
const { validateFields } = require("../middlewares/validateFields");

const requestRouter = Router();
requestRouter.get("/", [validateJWT], getAllTheRequests);

requestRouter.get(
  "/students/:matricula",
  [
    validateJWT,
    check("matricula", "La matricula del estudiante es obligatoria").notEmpty(),
    validateFields,
    checkStudentExistence,
  ],
  getRequestsFromStudent
);

requestRouter.post(
  "/",
  [
    validateJWT,
    check("matricula", "La matricula del estudiante es obligatoria")
      .isString()
      .notEmpty(),
    check("document_type", "Tipo de documento es obligatorio")
      .exists({ checkNull: true })
      .isInt(),
    validateFields,
    checkStudentExistence,
    isValidDocumentType,
  ],
  createRequest
);

requestRouter.post(
  "/:id_request",
  [
    validateJWT,
    param(
      "id_request",
      "El id de la solicitud es obligatorio y debe de ser un numero entero"
    ).isNumeric(),
    validateFields,
    checkRequestExistance,
  ],
  completeARequest
);

requestRouter.delete(
  "/:id_request",
  [
    validateJWT,
    param(
      "id_request",
      "El id de la solicitud es obligatorio y debe de ser un numero entero"
    ).isNumeric(),
    validateFields,
    checkRequestExistance,
  ],
  deleteRequest
);

module.exports = requestRouter;
