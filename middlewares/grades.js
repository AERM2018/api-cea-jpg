const { response } = require("express");

const checkGradeOrGrades = (req, res = response, next) => {
  let { students } = req.body;
  let except = [];
  if (!students) {
    students = [{ grade: req.body.grade }];
  }
  students.forEach(({ grade }) => {
    try {
      console.log(Number.parseFloat(grade));
      if (isNaN(Number.parseFloat(grade))) {
        except.push(grade);
      } else if (
        Number.parseFloat(grade) < 0.0 ||
        Number.parseFloat(grade) > 10.0
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
      msg: "La calificación debe ser un numero y debe estar en el rango de 0.0 a 10.0",
    });
  }
  next();
};

module.exports = checkGradeOrGrades;
