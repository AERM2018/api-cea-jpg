const { response } = require("express");
const moment = require("moment");
const { Op, literal } = require("sequelize");
const Assit = require("../models/assit");
const Campus = require("../models/campus");
const Card = require("../models/card");
const Course = require("../models/courses");
const Cou_tea = require("../models/cou_tea");
const Department = require("../models/department");
const Document = require("../models/document");
const Employees = require("../models/employee");
const ExtraCurricularCourses = require("../models/extracurricularcourses");
const Grades = require("../models/grades");
const Graduation_courses = require("../models/graduation_courses");
const Graduation_section = require("../models/graduation_section");
const Group = require("../models/group");
const Gro_cou = require("../models/gro_cou");
const Major = require("../models/major");
const Payment = require("../models/payment");
const Pay_info = require("../models/pay_info");
const Student = require("../models/student");
const Stu_extracou = require("../models/stu_extracou");
const Teacher = require("../models/teacher");
const Tesine = require("../models/tesine");
const Test = require("../models/test");
const User = require("../models/user");
const Request = require("../models/request");
const { document_types } = require("../types/dictionaries");
const Stu_gro = require("../models/stu_gro");
const { printAndSendError } = require("../helpers/responsesOfReq");
const Rol_use = require("../models/rol_use");

const checkCampusExistence = async (req, res, next) => {
  const id_campus = req.body.id_campus | req.params.id_campus;
  const campus = await Campus.findOne({
    where: { id_campus },
  });
  if (!campus) {
    return res.status(404).json({
      ok: false,
      msg: `El campus con el id ${id_campus} no existe`,
    });
  }
  next();
};

const checkStudentExistence = async (req, res = response, next) => {
  const matricula = req.body.matricula || req.params.matricula;
  const student = await Student.findOne({
    where: { matricula },
  });
  if (!student) {
    return res.status(404).json({
      ok: false,
      msg: `El estudiante con matricula ${matricula} no existe`,
    });
  }

  req.id_student = student.toJSON()["id_student"];
  next();
};

const checkStudentEnroll = async (req, res = respone, next) => {
  const { id_student } = req;
  const enroll_payments = await Pay_info.findAndCountAll({
    where: {
      id_student,
      payment_type: "Inscripción",
    },
    attributes: { exclude: ["id"] },
  });
  req.enroll = enroll_payments.count > 0 ? true : false;
  // console.log(req.enroll)

  next();
};

const hasStudentTakenCourse = async (req, res = response, next) => {
  const id_course = req.params.id_course || req.body.id_course;
  const matricula = req.params.matricula || req.body.matricula;
  const { id_student } = req;
  const gradeTest = await Test.findOne({
    where: {
      id_grade: {
        [Op.eq]: literal(
          `(SELECT id_grade FROM grades WHERE id_course = ${id_course} AND id_student ='${id_student}')`
        ),
      },
    },
  });
  if (!gradeTest)
    return res.status(404).json({
      ok: false,
      msg: `El alumno con matricula ${matricula} aún no tiene una calificaión de tipo ordinaria de la materia con id ${id_course}.`,
    });
  next();
};

const checkEmployeeExistence = async (req, res = response, next) => {
  const id_user = req.body.id_user || req.params.id_user || req.id_user;
  const employee = await Employees.findOne({
    where: { id_user },
  });
  if (!employee) {
    return res.status(404).json({
      ok: false,
      msg: `El trabajador con id ${id_user} no existe`,
    });
  }

  req.id_employee = employee.toJSON()["id_employee"];
  next();
};

const checkDepartmentExistence = async (req, res = response, next) => {
  const id_department = req.params.id_department || req.body.id_department;
  const department = await Department.findOne({
    where: {
      id_department: id_department,
    },
  });

  if (!department) {
    return res.status(404).json({
      ok: false,
      msg: `El departamento con id ${id_department} no existe`,
    });
  }

  next();
};

const checkPaymentExistence = async (req, res = response, next) => {
  const id_payment = req.params.id_payment || req.body.id_payment;
  const payment = await Payment.findOne({
    where: {
      id_payment: id_payment,
    },
  });

  if (!payment) {
    return res.status(404).json({
      ok: false,
      msg: `El pago con id ${id_payment} no existe`,
    });
  }

  next();
};

const checkGroupExistence = async (req, res = response, next) => {
  const id_group = req.params.id_group || req.body.id_group;
  const group = await Group.findOne({
    where: { id_group },
  });
  if (!group) {
    return res.status(404).json({
      ok: false,
      msg: `El grupo con id ${id_group} no existe`,
    });
  }
  next();
};

// Checar que el id de card venga en el req cuando sea necesario
const isValidCard = async (id_card = null, req) => {
  const { payment_method } = req.body;
  if (
    // payment_method.toLowerCase() === "tarjeta" ||
    payment_method.toLowerCase() === "depósito"
  ) {
    if (!id_card)
      throw Error(`La tarjeta a la cual va dirigo el pago es obligatoria.`);
  } else {
    if (id_card || id_card === 0)
      throw Error(`La tarjeta a la cual va dirigo el pago no es requerida.`);
  }

  return true;
};

const checkCardExistence = async (req, res = response, next) => {
  const { id_card } = req.body;
  if (id_card != null) {
    const card = await Card.findByPk(id_card);
    if (!card) {
      return res.status(404).json({
        ok: false,
        msg: `La tarjeta con id ${id_card} no existe.`,
      });
    }
  }

  next();
};

// Checar que el document_type venga en el req cuando sea necesario
const isValidDocument = (document_type = null, req) => {
  const { payment_type } = req.body;
  if (payment_type.toLowerCase() != "documento") {
    if (document_type || document_type === 0)
      throw Error(`El tipo de documento no es requerido.`);
  } else {
    if (document_type === null)
      throw Error(`El tipo de documento es obligatorio.`);
  }
  return true;
};

const isValidDocumentType = (req, res, next) => {
  const { document_type } = req.body;
  if (document_type !== null) {
    if (
      !document_types
        .map((document_type) => document_type.id)
        .includes(document_type)
    )
      return res
        .status(404)
        .json({ ok: false, msg: `Tipo de documento invalido` });
  }
  next();
};

const checkDocumentExistance = (req, res, next) => {
  const { id_document } = req.params;
  const document = Document.findByPk(id_document);
  if (!document) {
    res.status(404).json({
      ok: false,
      msg: `El documento con id ${id_document} no existe.`,
    });
  }
  next();
};

const isValidPaymentMethod = (payment_method = " ") => {
  if (
    !["tarjeta", "depósito", "efectivo"].includes(payment_method.toLowerCase())
  ) {
    throw Error("Métdodo de pago invalido.");
  } else {
    return true;
  }
};
const isValidPaymentType = (payment_type = " ") => {
  if (
    !["documento", "inscripción", "materia", "curso extracurricular"].includes(
      payment_type.toLowerCase()
    )
  ) {
    throw Error("Tipo de pago invalido.");
  } else {
    return true;
  }
};

const isValidStartDate = (start_date) => {
  if (start_date != null) {
    if (start_date < 0 || start_date > 11)
      throw new Error("Start date inválido");
  }

  return true;
};
const isValidEduLevel = (edu_level) => {
  try {
    if (![1, 2].includes(parseInt(edu_level)))
      throw new Error("Nivel de eduación inválido");

    return true;
  } catch (error) {
    throw new Error("Nivel de eduación inválido");
  }
};

const checkTeacherExistence = async (req, res = response, next) => {
  const id_teacher = req.body.id_teacher || req.params.id_teacher;
  const teacher = await Teacher.findByPk(id_teacher);
  if (!teacher) {
    return res.status(404).json({
      ok: false,
      msg: `El teacher con el id ${id_teacher} no existe`,
    });
  }
  next();
};

const checkGraduationCourseExistence = async (req, res = response, next) => {
  const id_graduation_course =
    req.body.id_graduation_course || req.params.id_graduation_course;
  const graduationCourse = await Graduation_courses.findByPk(
    id_graduation_course
  );
  if (!graduationCourse) {
    return res.status(404).json({
      ok: false,
      msg: `El curso de graduación con el id ${id_graduation_course} no existe`,
    });
  }
  next();
};

const checkMajorExistence = async (req, res = response, next) => {
  const id_major = req.body.id_major || req.params.id_major;
  const major = await Major.findByPk(id_major);
  if (!major) {
    return res.status(404).json({
      ok: false,
      msg: `La carrera con el id ${id_major} no existe`,
    });
  }
  next();
};

const checkGradeCourseExistence = async (req, res, next) => {
  const id_grade = req.body.id_grade || req.params.id_grade;
  const grade = await Grades.findByPk(id_grade);
  if (!grade) {
    return res.status(404).json({
      ok: false,
      msg: `La calificación con id ${id_grade} no existe`,
    });
  }
  next();
};
const checkGradeExtraCurCoureExistence = async (req, res, next) => {
  const id_stu_extracou =
    req.body.id_stu_extracou || req.params.id_stu_extracou;
  const grade = await Stu_extracou.findByPk(id_stu_extracou);
  if (!grade) {
    return res.status(404).json({
      ok: false,
      msg: `La calificación con id ${id_stu_extracou} no existe`,
    });
  }
  next();
};
const checkGradeTesineExistence = async (req, res, next) => {
  const id_tesine = req.body.id_tesine || req.params.id_tesine;
  const grade = await Tesine.findByPk(id_tesine);
  if (!grade) {
    return res.status(404).json({
      ok: false,
      msg: `La calificación con id ${id_tesine} no existe`,
    });
  }
  next();
};

const checkExtraCurCourExistence = async (req, res, next) => {
  const id_ext_cou = req.body.id_ext_cou || req.params.id_ext_cou;
  const extraCurCour = await ExtraCurricularCourses.findByPk(id_ext_cou);
  if (!extraCurCour) {
    return res.status(404).json({
      ok: false,
      msg: `El curso extra curricular con id ${id_ext_cou} no existe.`,
    });
  }
  next();
};
// De nada, te ahorré trabajo

const checkGraSecExistence = async (req, res, next) => {
  const id_graduation_section =
    req.body.id_graduation_section || req.params.id_graduation_section;
  const graSec = await Graduation_section.findByPk(id_graduation_section);
  if (!graSec) {
    return res.status(404).json({
      ok: false,
      msg: `La sección del curso de graduación con id ${id_graduation_section} no existe.`,
    });
  }
  next();
};
const checkCourseExistence = async (req, res, next) => {
  const id_course = req.body.id_course || req.params.id_course;
  const clave = req.body.clave;
  const course = await Course.findOne({
    where: {
      [Op.or]: [
        { ...(id_course ? { id_course } : {}) },
        { ...(clave ? { clave } : {}) },
      ],
    },
  });
  if (!course && id_course) {
    return res.status(404).json({
      ok: false,
      msg: `El curso con id ${id_course} no existe.`,
    });
  }
  if (course && clave !== undefined) {
    return res.status(400).json({
      ok: false,
      msg: `El curso con clave ${clave} ya existe.`,
    });
  }
  next();
};

const isValidRestrictionCourseOrExtraCourse = (val) => {
  if (val !== null && typeof val !== "number") return false;
  if (val === null || Number.isInteger(val)) return true;
};

const checkGroupCourseExistence = async (req, res, next) => {
  const id_gro_cou = req.body.id_gro_cou || req.params.id_gro_cou || undefined;
  const id_group = req.body.id_group || req.params.id_group || undefined;
  const id_course = req.body.id_course || req.params.id_course || undefined;
  const condition = id_gro_cou ? { id_gro_cou } : { id_group, id_course };
  const gro_cou = await Gro_cou.findOne({ where: condition });
  if (!gro_cou) {
    return res.status(404).json({
      ok: false,
      msg: `No se encuentra un curso asociado con el grupo especificado.`,
    });
  }
  next();
};

const checkAssitExistence = async (req, res, next) => {
  const id_assistance = req.body.id_assistance || req.params.id_assistance;
  const assit = await Assit.findByPk(id_assistance);
  if (!assit) {
    return res.status(404).json({
      ok: false,
      msg: `La asistencia con id ${id_assistance} no existe.`,
    });
  }
  next();
};

const checkUserExistance = async (req, res = response, next) => {
  const email = req.params.email || req.body.email || "";
  const user = await User.findOne({ where: { email } });
  console.log(user);
  if (!user) {
    return res.json({
      ok: false,
      msg: `No existe un usuario con email ${email}`,
    });
  }
  req.user = user;
  next();
};

const isAllowedToUploadGrades = async (req, res, next) => {
  let id_course = req.params.id_course || req.body.id_course || undefined;
  let id_group = req.params.id_group || req.body.id_group || undefined;
  const { start_date } = await Gro_cou.findOne({
    where: { [Op.and]: [{ id_course }, { id_group }] },
  });
  if (
    !req.roles.includes(1) &&
    !req.roles.includes(2) &&
    !moment().isSameOrBefore(moment(start_date).endOf("month"))
  ) {
    //true
    return res.status(403).json({
      ok: false,
      msg: "Publicación de calificaciones denegada, la fecha para publicar calificaciones ha vencido. Comuniquese con el departamento de administración.",
    });
  }
  next();
};

const checkRoles = (rolesWithPermission = []) => {
  return (req, res, next) => {
    const { roles = [] } = req;
    if (!roles.some((role) => rolesWithPermission.includes(role))) {
      res.status(403).json({
        ok: false,
        msg: "Acción denegada, no tiene los persmisos necesarios.",
      });
    }
    next();
  };
};

const checkRequestExistance = async (req, res, next) => {
  const id_request = req.params.id_request || req.body.id_request;
  const request = await Request.findByPk(id_request);
  if (!request) {
    return res.status(400).json({
      ok: false,
      msg: `No existe la peticion con el id ${id_request}`,
    });
  }
  next();
};

const isRestrictionValid = async (req, res, next) => {
  const {
    restricted_course,
    restricted_extracourse,
    mandatory_course,
    mandatory_extracourse,
  } = req.body;
  let course;
  if (restricted_course === undefined || mandatory_course === undefined) {
    // course =
  }
};

const isStudentPartOfAGroup = async (req, res, next) => {
  const { id_student } = req;
  const id_group = req.params.id_group || req.body.id_group;
  const matricula = req.params.matricula || req.body.matricula;
  const stu_gro = await Stu_gro.findOne({
    where: { [Op.and]: [{ id_student }, { id_group }, { status: 1 }] },
  });
  if (!stu_gro) {
    return res.status(400).json({
      ok: false,
      msg: `El estudiante con matricula ${matricula} no puede ser jefe de grupo porque no pertence a él.`,
    });
  }
  next();
};

const isUserAllowedToUpdateGrade = async (req, res, next) => {
  const { id_user } = req;
  const { id_grade } = req.params;
  Grades.belongsTo(Student, { foreignKey: "id_student" });
  Student.hasOne(Grades, { foreignKey: "id_student" });
  try {
    // Get user's type
    const user = await User.findByPk(id_user);
    const user_roles = await Rol_use.findAll({
      where: { id_user },
      attributes: ["id_role"],
    });
    const grade = await Grades.findByPk(id_grade, {
      include: { model: Student, attributes: ["matricula"] },
    });
    const {
      id_student,
      id_course,
      student: { matricula },
    } = grade.toJSON();
    const studentGroup = await Stu_gro.findOne({
      where: { [Op.and]: [{ id_student }, { status: 1 }] },
    });
    if (!studentGroup) {
      return res.status(400).json({
        ok: false,
        msg: `Acción denegada. El estudiante con matricula ${matricula} está dado de baja, por lo tanto no se puede actualizar ninguna calificación correspondiente a él.`,
      });
    }
    const gro_cou = await Gro_cou.findOne({
      where: { [Op.and]: [{ id_course }, { id_group: studentGroup.id_group }] },
    });
    if (moment(gro_cou.end_date).isBefore(moment())) {
      if (user.user_type === "teacher") {
        return res.status(400).json({
          ok: false,
          msg: `Acción denegada. La calificacíon no puede ser actualizada por el maestro después de la fecha de fin del curso.`,
        });
      } else {
        // Verify if user has permission to upload grade
        // Role 4 is for administrative users
        if (
          !user_roles
            .map((user_role) => user_role.id_role)
            .some((user_role) => [1, 2, 4].includes(user_role))
        ) {
          return res.status(400).json({
            ok: false,
            msg: `Acción denegada. El usuario no cuenta con los permisos necesarios para actualizar la calificación.`,
          });
        }
      }
    } else {
      if (
        !user_roles
          .map((user_role) => user_role.id_role)
          .some((user_role) => [1, 2, 4, 9].includes(user_role))
      ) {
        return res.status(400).json({
          ok: false,
          msg: `Acción denegada. El usuario no cuenta con los permisos necesarios para actualizar la calificación.`,
        });
      }
    }
    next();
  } catch (error) {
    printAndSendError(res, error);
  }
};

const isGroupTakingGraduationCourse = async (req, res, next) => {
  try {
    const { id_group } = req.params;
    const { id_graduation_course } = await Group.findByPk(id_group);
    if (id_graduation_course) {
      if (req.method === "POST") {
        return res.json({
          ok: false,
          msg: `El grupo con id ${id_group} ya se encuentra cursando un curso de graduación.`,
        });
      }
    } else {
      if (req.method === "DELETE") {
        return res.json({
          ok: false,
          msg: `El grupo con id ${id_group} no se ha empezado un curso de graduación aún.`,
        });
      }
    }
    next();
  } catch (err) {
    printAndSendError(res, err);
  }
};
module.exports = {
  checkCampusExistence,
  checkStudentExistence,
  checkEmployeeExistence,
  checkDepartmentExistence,
  checkPaymentExistence,
  checkGroupExistence,
  checkStudentEnroll,
  isValidCard,
  checkCardExistence,
  isValidDocument,
  checkDocumentExistance,
  isValidPaymentMethod,
  isValidPaymentType,
  isValidStartDate,
  isValidEduLevel,
  checkTeacherExistence,
  checkGraduationCourseExistence,
  checkMajorExistence,
  checkGradeCourseExistence,
  checkGradeExtraCurCoureExistence,
  checkGradeTesineExistence,
  checkExtraCurCourExistence,
  checkGraSecExistence,
  checkCourseExistence,
  checkGroupCourseExistence,
  checkAssitExistence,
  isValidDocumentType,
  checkUserExistance,
  isAllowedToUploadGrades,
  checkRoles,
  hasStudentTakenCourse,
  checkRequestExistance,
  isRestrictionValid,
  isValidRestrictionCourseOrExtraCourse,
  isStudentPartOfAGroup,
  isUserAllowedToUpdateGrade,
  isGroupTakingGraduationCourse,
};
