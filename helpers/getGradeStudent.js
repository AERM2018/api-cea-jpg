const Grades = require("../models/grades");

const getGradesStudent = async( id_student = "", getAvg = false) => {
    let avgStudent = 0;
    const gradesStudent = await Grades.findAll({
        where : {id_student},
        attributes : ['id_course','grade']
    })

    if(getAvg){
        gradesStudent.forEach( grade => {
            avgStudent += grade.toJSON().grade
        })

        avgStudent /= gradesStudent.length

        return  avgStudent
    }

    return gradesStudent
}

module.exports = {
    getGradesStudent    
};
