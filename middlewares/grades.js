const { response } = require("express");

 const checkGrades = ( req, res = response, next) => {
    const { students } = req.body;
    let except = [];
    students.forEach( ({grade}) => {
        try {
            console.log(Number.parseFloat(grade))
            if(isNaN(Number.parseFloat(grade))){
                except.push(grade)
            }
        } catch (error) {
            console.log(error)
        }
    });

    if(except.length > 0){
        return res.status(400).json({
            ok : false,
            msg : 'La calificación de cada alumno debe ser un numero entero con punto decimal'
        })
    }
    next();
 }


 module.exports = checkGrades;