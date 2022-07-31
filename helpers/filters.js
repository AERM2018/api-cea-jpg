const filterGradesStudent = ( gradesStudent = [], q = '') => {

    return gradesStudent.filter( gradeStudent => {
        const { student } = gradeStudent.toJSON()
        // console.log(        `${student.name}${student.surname_f}${student.surname_m}`
        // )
        // if(
        //     `${student.name}${student.surname_f}${student.surname_m}`.toLowerCase().includes(q) ||
        //     (student.matricula.toLowerCase().includes(q))
        // ) return gradeStudent
        if (
          `${student.surname_m}${student.surname_f}${student.name}`
            .toLowerCase()
            .includes(q)
        ) {
          gradeStudent.q = "student_name";
          return gradeStudent;
        }
        if ((student.matricula.toLowerCase().includes(q))){
            gradeStudent.q = 'matricula'
            return gradeStudent
        }
        // console.log('Paso por aquí',query,`${student.name}${student.surname_f}${student.surname_m}`.includes(q))
        // query = ((student.stu_gro && student.stu_gro.groupss.name_group.split(' ').join('')  === (q))) && 'group_name'
        })

}

module.exports = {
    // filterGradesStudent
};
