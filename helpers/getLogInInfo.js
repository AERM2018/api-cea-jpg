const { fn, col } = require("sequelize");
const Teacher = require("../models/teacher");
const Employees = require("../models/employee");
const Student = require("../models/student");

const getLogInInfo = async (id_user, user_type) => {
  let userEntityInfo;
  switch (user_type) {
    case "teacher":
      userEntityInfo = await Teacher.findOne({
        where: { id_user },
        attributes: [
          "id_teacher",
          [
            fn(
              "concat",
              col("name"),
              " ",
              col("surname_f"),
              " ",
              col("surname_m")
            ),
            "name",
          ],
        ],
      });
      break;
    case "employee":
      userEntityInfo = await Employees.findOne({
        where: { id_user },
        attributes: [
          "id_employee",
          [
            fn(
              "concat",
              col("name"),
              " ",
              col("surname_f"),
              " ",
              col("surname_m")
            ),
            "name",
          ],
        ],
      });
      break;
    case "student":
      userEntityInfo = await Student.findOne({
        where: { id_user },
        attributes: [
          "id_student",
          "matricula",
          [
            fn(
              "concat",
              col("name"),
              " ",
              col("surname_m"),
              " ",
              col("surname_f")
            ),
            "name",
          ],
        ],
      });
      break;
    default:
      return {};
  }
  console.log(userEntityInfo.toJSON());
  return userEntityInfo.toJSON();
};

module.exports = {
  getLogInInfo,
};
