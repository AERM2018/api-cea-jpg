const Grades = require("../models/grades")
const { db } = require('../database/connection');
const { QueryTypes, Op, where, fn, col } = require('sequelize');
const { response, request } = require("express");
const Course = require("../models/courses");
const Group = require("../models/group");
const { getGrades } = require("../queries/queries");
const Stu_gro = require("../models/stu_gro");
const Student = require("../models/student");
const { printAndSendError } = require("../helpers/responsesOfReq");
const { getGradesStudent } = require("../helpers/getGradeStudent");

const getAllGradesByCourse = async (req, res = response) => {
    const { id_course } = req.params
    const { id_group } = req.query

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
        const grades = await db.query(getGrades, { replacements: { 'id_course': id_course, 'id_group': id_group }, type: QueryTypes.SELECT });

        res.status(200).json({
            ok: true,
            grades
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador."
        })
    }
}

const getAllGroupsGrade = async ( req, res =  response)=>{
    const { edu_level, major} = req.query

    const groups = await Group.findAll({
        where : {
            // edu_level,
            // major
        }
    })

    const groupsGrades = groups.map( async({id_group, name_group}) => {
        let avgGroup = 0;

        let studentsGroup = await Stu_gro.findAll({
            where : {
                id_group
            },
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
            avgGroup
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
    const {id_group} = req.params

    const group = await Group.findOne({
        where : {id_group},
        attributes : ['id_group','name_group']
    })


    Student.hasOne(Stu_gro, {foreignKey : 'id_student'})
    Stu_gro.belongsTo(Student, {foreignKey : 'id_student'})
    let studentsGroup = await Stu_gro.findAll({
        where : {
            id_group
        },
        include: { model : Student, attributes : [[fn('concat',col('name')," ",col('surname_f')," ",col('surname_m')),'fullname']]},
        attributes : ['id_student']
    })

    studentsGroup = studentsGroup.map( studentGroup => ({id_student : studentGroup.toJSON().id_student,fullname : studentGroup.toJSON().student.fullname}))

    studentsGroup = studentsGroup.map( async(student) => {
        const avgStudent = await getGradesStudent(student.id_student, true)
        return {...student,avg: avgStudent}
    })

    Promise.all(studentsGroup).then( students => {
        res.json({
            ok: true,
            students
        })
    })
}
const getAllGradesByStudent = async ( req, res = response ) => { 
    const {id_student} = req;

    try{
        Course.hasOne(Grades,{ foreignKey: 'id_course' });
        Grades.belongsTo(Course, { foreignKey : 'id_course'})
        let gradesStudents = await Grades.findAll({
            where : { 'id_student' : id_student },
            include: { model: Course, attributes: ['course_name']},
            attributes : ['grade']
        })

        gradesStudents = gradesStudents.map(({grade,course}) => {
            return {grade,course_name : course.course_name}
        })
        
        res.json({
            ok: true,
            grades : gradesStudents
        })
    }catch( err ){
        printAndSendError(res, err)
    }
}

const uploadGrades = async (req, res = response) => {

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
            }else{
                return {...student, id_student}
            }
            
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
            grades.map( async({id_student, grade}) => {
                try {
                    const studentGrade = new Grades({ id_course, id_student, grade })
                    await studentGrade.save();
    
                } catch (err) {
                    console.log(`Ya existe una calificación para el alumno con id ${id_student}, no se registró para evitar un duplicado`)
    
                }
            })
        })

        
            

        // });
        res.status(200).json({
            ok: true,
            msg: "Calificaciones cargadas correctamente.",
            except
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador."
        })
    }
}

const updateGrades = async (req, res = response) => {
    const { id_course } = req.params;
    const { students, id_group } = req.body;

    try {
        // check if the course exists
        const course = await Course.findByPk(id_course);
        if (!course) {
            return res.status(404).json({
                ok: false,
                msg: `El curso con id ${id_course} no existe, verifiquelo por favor.`
            })
        }

        // check if the group exists
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
            where: { 'id_group': id_group }
        })

        const idstudents_group = stu_gro.map(e => e['id_student'])
        let except = [];
        students.forEach(({ id_student }) => {
            if (!idstudents_group.includes(id_student)) {
                except.push(id_student)
            }
        })

        if (except.length > 0) {
            return res.status(404).json({
                ok: false,
                msg: `No se ha podido actualizar calificaciones debido a id(s) no registrados con el grupo con id ${id_group} `,
                "id´s": except
            })
        }

        // iterate array to get every student and modify his grade
        students.forEach(async ({ id_student, grade }) => {
            await Grades.update({ grade }, { where: { 'id_student': id_student } })
        });

        res.status(200).json({
            ok: true,
            msg: "Calificaciones actualizadas correctamente."
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            ok: false,
            msg: "Hable con el administrador."
        })
    }
}

const deleteGradeByStudentId = async (req, res = response) => {
    const { id_course } = req.params;
    const { id_student } = req.body;

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
    uploadGrades,
    updateGrades,
    deleteGradeByStudentId,
    getAllGradesByStudent,
    getAllGroupsGrade,
    getAllGradesByGroup
}