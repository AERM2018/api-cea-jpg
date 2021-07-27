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
const { getGradesStudent } = require("../helpers/getGradeStudent");
const { getGroupDaysAndOverdue } = require("../helpers/dates");
const Payment = require("../models/payment");
const Stu_pay = require("../models/stu_pay");
const Stu_extracou = require('../models/stu_extracou');
const Gro_cou = require('../models/gro_cou');
const Tesine = require('../models/tesine');
const Teacher = require('../models/teacher');

const getAllGrades = async( req, res = response) => {
    let grades;
    let {id_course, id_ext_cou, id_tesine, id_group} = req.query
    if(id_course){
        Grades.belongsTo(Student, {foreignKey : 'id_student'})
        Student.hasMany( Grades, {foreignKey : 'id_student'})
        grades = await Grades.findAll({
            include: {
                model : Student
            },
            where : {
                id_student : {
                    [Op.in] :[literal(`SELECT id_student FROM stu_gro${(id_group ? ` WHERE id_group = ${id_group}` : '')}`)]
                }
            }
        })
    }else if(id_ext_cou){
        Stu_extracou.belongsTo(Student, {foreignKey : 'id_student'})
        Student.hasMany(Stu_extracou, {foreignKey : 'id_student'})
        grades = await Stu_extracou.findAll({
            include : {
                model : Student,
                attributes : [[fn('concat',col('name')," ",col('surname_f')," ",col('surname_m')),'student_name'],'id_student','matricula']
            },
            attributes : { exclude : ['id_student']},
            where : { id_ext_cou}
        })

        grades = grades.map( grade => ({...grade.toJSON(),...grade.toJSON().student, student : undefined}))
    }else if(id_tesine){
        Tesine.belongsTo(Teacher, { foreignKey: 'id_teacher'})
        Teacher.hasMany(Tesine, { foreignKey: 'id_teacher'})
        grades = await Tesine.findByPk(id_tesine,{
            include : {
                model : Teacher,
                attributes : [[fn('concat',col('name')," ",col('surname_f')," ",col('surname_m')),'teacher_name'],'id_teacher']
            }
        })
        
            const {teacher, ...restoTesineGrade} = grades.toJSON()
            grades =  {
                ...restoTesineGrade,
                ...teacher
            }
        
        grades = (grades) ? grades : []

    }

    res.json({
        ok : true,
        grades
    })
}

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
        printAndSendError(err);
    }
}

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
    let {id_group = 0, group_name = ''} = req.query
    if(id_group == 0 && group_name == '') return res.redirect('all')

    const group = await Group.findOne({
        where : {
            [Op.or] : [
                {id_group},
                {name_group :group_name}
            ]
        },
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
    try {   
        const grades = await getGradesStudent( id_student, false )

        res.json({
            ok : true,
            grades
        })
    } catch ( err ) {
        printAndSendError( res, err)
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
    uploadGrades,
    updateGrades,
    deleteGradeByStudentId,
    searchAverageByStudent,
    getAllGroupsGrades,
    getAllGradesByGroup,
    getAllGrades,
    getAllGradesByMatricula
}