const moment = require('moment');
const Grades = require("../models/grades")
const { db } = require('../database/connection');
const { QueryTypes, Op, where, fn, col, literal } = require('sequelize');
const { response, request } = require("express");
const Course = require("../models/courses");
const Group = require("../models/group");
const { getGrades } = require("../queries/queries");
const Stu_gro = require("../models/stu_gro");
const Student = require("../models/student");
const { printAndSendError } = require("../helpers/responsesOfReq");
const { getGradesStudent, getExtraCoursesGradesStudent, getTesineGradeStudent } = require("../helpers/students");
const { getGroupDaysAndOverdue } = require("../helpers/dates");
const Payment = require("../models/payment");
const Stu_pay = require("../models/stu_pay");
const Stu_extracou = require('../models/stu_extracou');
const Gro_cou = require('../models/gro_cou');
const Tesine = require('../models/tesine');
const Teacher = require('../models/teacher');
const { filterGradesStudent } = require('../helpers/students');
const Stu_gracou = require('../models/stu_gracou');
const Major = require('../models/major');
const Educational_level = require('../models/educational_level');

const getAllGrades = async( req, res = response) => {
    let grades;
    let {q = '', page = 1}=req.query
    q = q.toLowerCase().split(' ').join('');

    Stu_gro.belongsTo(Student,{ foreignKey : 'id_student'})
    Student.hasMany(Stu_gro,{ foreignKey : 'id_student'})

    Stu_gro.belongsTo(Group,{ foreignKey : 'id_group'})
    Group.hasOne(Stu_gro,{ foreignKey : 'id_group'})

    Group.belongsTo(Major,{ foreignKey : 'id_major'})
    Major.hasOne(Group,{ foreignKey : 'id_major'})

    Major.belongsTo(Educational_level,{ foreignKey : 'id_edu_lev'})
    Educational_level.hasMany(Major,{ foreignKey : 'id_edu_lev'})
    let students = await Student.findAll({
           include : [{
               model : Stu_gro,
                include : {
                    model : Group,
                    include : {
                        model : Major,
                        include : {
                            model : Educational_level
                        }
                    }
                }
           }],
           where : {id_student : {[Op.in] : literal('(SELECT id_student FROM grades)')}}
    })
    
    // console.log(students[0].toJSON())
    
    students = students.map( async(student) => {
        const { stu_gros, ...restoStudent } = student.toJSON()
        
        const {groupss, groupss:{major}, groupss:{major:{educational_level}}} = stu_gros[stu_gros.length - 1]
        return {
            id_student  : restoStudent.id_student,
            matricula : restoStudent.matricula,
            student_name : `${restoStudent.name} ${restoStudent.surname_f} ${restoStudent.surname_m}`,
            group_name : groupss.name_group,
            major_name : `${educational_level.educational_level} en ${major.major_name}`,
            q
        }
    })
    students = await Promise.all(students)
    
    students = filterGradesStudent(students,q)

    students = students.filter((student,i) => i >= (9*page)-9 && i <= 9*page)



    // //
    // let groups = await Group.findAll({ limit:[10*(page-1),10]})
    // groups = groups.filter( ({name_group}) => name_group.split(' ').join('').includes(q))
    // let avgByGroups = groups.map( async(group) => {
    //     const studentsBelongToGroup = await Stu_gro.findAll({
    //         where : {id_group : group.id_group}
    //     })

    //     let avgStudents = studentsBelongToGroup.map( async(student) => await(getGradesStudent(student.id_student,true)))
    //     avgStudents = await Promise.all(avgStudents)

    //     let avgGroup = avgStudents.reduce( (pre,cur) => (pre+cur))
    //     avgGroup /= avgStudents.length

    //     return {
    //         id_group : group.id_group,
    //         group_name : group.name_group,
    //         avg : avgGroup,
    //         q : 'group_name'
    //     }
    // })
    // avgByGroups = await Promise.all(avgByGroups)

    grades = [...students]
    res.json({
        ok : true,
        grades
    })
}

const getAllGradesByCourse = async (req, res = response) => {
    const { id_course, id_group} = req.body

    try {

        // Check if the course exists
        const course = await Course.findByPk(id_course);
        if (!course) {
            return res.status(404).json({
                ok: false,
                msg: `El curso con id ${id_course} no existe, verifíquelo por favor.`
            })
        }
        // Check if the group exists
        const group = await Group.findOne({
            where: { 'id_group': id_group }
        })
        if (!group) {
            return res.status(404).json({
                ok: false,
                msg: `El grupo con id ${id_group} no existe, verifiquelo por favor.`
            })
        }
        Grades.belongsTo(Course,{ foreignKey: 'id_course'})
        Course.hasMany(Grades,{ foreignKey: 'id_course'})

        Grades.belongsTo(Student, { foreignKey : 'id_student'})
        Student.hasMany(Grades, { foreignKey : 'id_student'})

        let grades = await Grades.findAll({
            include : [{
                model : Course,
                attributes : ['course_name','id_course']
            },
            {
                model : Student,
                attributes : ['id_student','matricula',[fn('concat',col('name'),' ',col('surname_f'),' ',col('surname_m')),'student_name']]
            }],
            where : { 
                id_course , 
                id_student : { [Op.in] : literal(`(SELECT id_student FROM stu_gro WHERE id_group = ${id_group})`)}
            }
        })

        grades = grades.map( grade => {
            const {course, student, ...restoGrade} = grade.toJSON();
            return {
                ...restoGrade,
                ...student,
                ...course
            }
        })
        res.status(200).json({
            ok: true,
            grades
        })
    } catch (err) {
        printAndSendError(res,err);
    }
}
// It's not working
const getAllGroupsGrades = async ( req, res =  response)=>{
    const { edu_level, major, group_name = '',id_group = 0} = req.query

    const groups = await Group.findAll({
        where : {
            // edu_level,
            // major
        }
    })

    const groupsGrades = groups.map( async({id_group, name_group}) => {
        let avgGroup = 0;

        let studentsGroup = await Stu_gro.findAll({
            where : { id_group },
            attributes : ['id_student']
        })

        studentsGroup = studentsGroup.map( studentGroup => studentGroup.toJSON().id_student)

        studentsGroup = studentsGroup.map( async(id_student) => {
            const avgStudent = await getGradesStudent( id_student, true)
            return {id_student, avg: avgStudent}
        })        
        
        const studentsAvgs = await Promise.all(studentsGroup)

        studentsAvgs.forEach( ({avg}) => {
            avgGroup += avg
        })
        avgGroup /= studentsGroup.length
        return {
            id_group,
            name_group,
            avg : avgGroup
        }      
    })

    Promise.all(groupsGrades).then( grades => {
        res.json({
            ok: true,
            groups : grades
        })
    })

}

const getAllGradesByGroup = async( req, res = response) => {
    let {id_group = 0 } = req.params

    const group = await Group.findOne({
        where :  {id_group},
        attributes : ['id_group','name_group']
    })

    id_group = (group) ? group.toJSON().id_group : '';
    Student.hasOne(Stu_gro, {foreignKey : 'id_student'})
    Stu_gro.belongsTo(Student, {foreignKey : 'id_student'})
    let studentsGroup = await Stu_gro.findAll({
        where : {
            id_group
        },
        include: { model : Student, attributes : ['id_student','matricula',[fn('concat',col('name')," ",col('surname_f')," ",col('surname_m')),'fullname']]},
        attributes : ['id_student']
    })

    studentsGroup = studentsGroup.map( studentGroup => {
        const {student,...restoGroupInfo} = studentGroup.toJSON()
        return {...student}

    })

    studentsGroup = studentsGroup.map( async(student) => {
        const avgStudent = await getGradesStudent(student.id_student, true)
        return {...student,avg: avgStudent}
    })

    Promise.all(studentsGroup).then( students => {
        res.json({
            ok: true,
            id_group : group.toJSON().id_group,
            group_name : group.toJSON().name_group,
            students
        })
    })
}
const searchAverageByStudent = async ( req, res = response ) => { 
    const {  name = ''} = req.query

    try{
        let coincidencesStudents = await Student.findAll({
            attributes : ['id_student','matricula',[fn('concat',col('name')," ",col('surname_f')," ",col('surname_m')),'name']],
            where : {
                [Op.or] : [
                    where(fn('concat',col('name'),col('surname_f'),col('surname_m')),{[Op.like] : `%${name}%`})
                ]
            }
        })
        if(coincidencesStudents.length > 0){
            coincidencesStudents =  coincidencesStudents.map( async(student) => {
                const avgStudent = await getGradesStudent(student.toJSON().id_student,true)
                return {...student.toJSON(),avgStudent}
    
            })
            coincidencesStudents = await Promise.all(coincidencesStudents)
        }
        
        res.json({
            ok: true,
            students : coincidencesStudents
        })
    }catch( err ){
        printAndSendError(res, err)
    }
}

const getAllGradesByMatricula = async( req, res = response) => {
    const { id_student } = req;
    const { page = 1 } = req.query
    try {
        let grades   
        const coursesGrades = await getGradesStudent( id_student, false )

        const extraCoursesGrades = await getExtraCoursesGradesStudent(id_student)

        const tesineGrade = await getTesineGradeStudent( id_student )

        // const gradCoruseGrade = await Stu_gracou.findOne({
        //     where : {id_student}
        // })
        grades = [...coursesGrades,...extraCoursesGrades,tesineGrade]
        grades = grades.filter((grade,i) => i >= (9*page)-9 && i <= 9*page)
        res.json({
            ok : true,
            grades
        })
    } catch ( err ) {
        printAndSendError( res, err)
    }

}
const uploadCourseGrades = async (req, res = response) => {

    const { id_course } = req.params;
    const {id_group } = req.body;
    let  students  = req.body.students;
    let except = [];

    try {

        // Check if the course exists
        const course = await Course.findByPk(id_course);
        if (!course) {
            return res.status(404).json({
                ok: false,
                msg: `El curso con id ${id_course} no existe, verifiquelo por favor.`
            })
        }

        // Check if the group exists
        const group = await Group.findOne({
            where: { 'id_group': id_group }
        })
        if (!group) {
            return res.status(404).json({
                ok: false,
                msg: `El grupo con id ${id_group} no existe, verifiquelo por favor.`
            })
        }

        // get ids' of the students which belong to the group
        const stu_gro = await Stu_gro.findAll({
            where: { 'id_group': id_group },
            
        })
        const idstudents_group = stu_gro.map(e => e['id_student'])

        let students_grades = students.map( async(student) => {
            const {id_student} = await Student.findOne( {where : { matricula : student.matricula }, attributes : ['id_student']} )
            if(!idstudents_group.includes(id_student)){
                except.push(id_student)
                return {}
            }
            return {...student, id_student}
            
        })

        // Check if there are grades for the course already to avoid duplicates
        const gradesCourse = await Grades.findAll({
            where: {
                'id_course': id_course,
                'id_student': { [Op.in]: idstudents_group }
            }
        })

        if (gradesCourse.length > 0) {
            return res.status(500).json({
                ok: false,
                msg: `No se ha podido cargar las calificaciones para el grupo con id ${id_group} debido a que ya existen. Si desea modificarlas, actualize las calificaciones`
            })
        }

        // Check if all the students given belong to the group given

        if (except.length > 0) {
            return res.status(404).json({
                ok: false,
                msg: `No se ha podido subir caliicaciones debido a id(s) no registrados con el grupo con id ${id_group} `,
                "id´s": except
            })
        }

        
        // // iterate array to get every student and create his grade voiding dupliactes
        Promise.all(students_grades).then((grades) => {
            grades.map( async(grade) => {
                console.log(grade)
                try {
                        const studentGrade = new Grades({ id_course, id_student : grade.id_student, grade : grade.grade })
                        await studentGrade.save();
                } catch (err) {
                    console.log(err)
                }
            })
        })


        res.status(200).json({
            ok: true,
            msg: "Calificaciones cargadas correctamente.",
            except
        })
    } catch (err) {
        printAndSendError(err);
    }
}

const uploadExtraCurCourGrades = async (req, res) =>{

    const {id_ext_cou}=req.params;
    let  {students}  = req.body;

    try {
        students=students.map( async({id_student, grade})=>{
          
            await Stu_extracou.update({grade}, {where: {[Op.and]:[{id_student},{id_ext_cou}]}})
        })
        
    } catch (err) {
        printAndSendError(res, err)
    }


}

// const uploadTesineGrade = async (req, res) =>{

//     const {id_tesine}=req.params;
//     let  {students}  = req.body;

//     try {
//         students=students.map( async({id_student, grade})=>{
          
//             await Stu_gracou.update({grade}, {where: {[Op.and]:[{id_student},{id_tesine}]}})
//         })
        
//     } catch (err) {
//         printAndSendError(res, err)
//     }


// }

const updateGrades = async (req, res = response) => {
    const { id_grade  } = req.params;
    const { grade }= req.body;

    try {
         await Grades.update({grade},{where: {id_grade} });

        res.json({
            ok:true,
            msg: 'Calificación de materia actualizada correctamente.'
        })
        
    } catch (err) {

    printAndSendError(res,err)
        
    }
}

const updateExtraCurCourGrades =async (req, res)=>{
    const {id_stu_extracou}= req.params;
    const {grade}=req.body;

    try{
        await Stu_extracou.update({grade},{where:{id_stu_extracou}});

        res.json({
            ok:true,
            msg: 'Calificación de curso extra curricular actualizada correctamente.'
        })
    }catch(err){
        printAndSendError(res, err)
    }

}
const updateTesineGrades =async (req, res)=>{
    const {id_tesine}= req.params;
    const {grade}=req.body;

    try{
        await Tesine.update({grade},{where:{id_tesine}});

        res.json({
            ok:true,
            msg: 'Calificación de tesina actualizada correctamente.'
        })
    }catch(err){
        printAndSendError(res, err)
    }

}

const deleteGradeByStudentId = async (req, res = response) => {
    const { id_course } = req.params;
    const { id_student } = req;

    try {
        // Check if the course exists
        const course = await Course.findByPk(id_course);
        if (!course) {
            return res.status(404).json({
                ok: false,
                msg: `El curso con id ${id_course} no existe, verifiquelo por favor.`
            })
        }

        //check if the student has the grade which wants to be deleted
        const grade = await Grades.findOne({
            where: {
                'id_course': id_course,
                'id_student': id_student,
            }
        })
        if (!grade) {
            return res.status(404).json({
                ok: false,
                msg: `El estudiante con id ${id_student} no cuenta con una calificación para el curso con id ${id_course}, verifiquelo por favor.`
            })
        }

        await grade.destroy();

        res.status(200).json({
            ok: true,
            msg: `Calificación del estudiante con id ${id_student} eliminada correctamente`
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            ok: false,
            msg: "Hable con el administrador."
        })
    }
}

module.exports = {
    getAllGradesByCourse,
    uploadCourseGrades,
    updateGrades,
    deleteGradeByStudentId,
    searchAverageByStudent,
    getAllGroupsGrades,
    getAllGradesByGroup,
    getAllGrades,
    getAllGradesByMatricula,
    updateExtraCurCourGrades,
    updateTesineGrades,
    uploadExtraCurCourGrades,
    // uploadTesineGrade
}