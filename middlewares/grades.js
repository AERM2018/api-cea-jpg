const { response } = require("express");

const checkGradeOrGrades = (req, res = response, next) => {
  let { students } = req.body;
  let except = [];
  if (!students) {
    students = [{ grade: req.body.grade }];
  }
  students.forEach(({ grade }) => {
    try {
      if (grade.toLowerCase() === "np") return;
      if (
        isNaN(parseFloat(grade)) ||
        parseFloat(grade) > 10.0 ||
        parseFloat(grade) < 0.0
      ) {
        except.push(grade);
      }
    } catch (error) {
      console.log(error);
    }
  });
  if (except.length > 0) {
    return res.status(400).json({
      ok: false,
      msg: "La calificación de cada alumno debe ser un número entre 0 y 10 o NP",
    });
  }
  next();
};

module.exports = checkGradeOrGrades;
