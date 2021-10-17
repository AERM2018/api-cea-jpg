const { response } = require('express');
const Assit = require('../models/assit');
const Campus = require('../models/campus');
const Card = require('../models/card');
const Course = require('../models/courses');
const Department = require('../models/department');
const Document = require('../models/document');
const Employees = require('../models/employee');
const ExtraCurricularCourses = require('../models/extracurricularcourses');
const Grades = require('../models/grades');
const Graduation_courses = require('../models/graduation_courses');
const Graduation_section = require('../models/graduation_section');
const Group = require('../models/group');
const Gro_cou = require('../models/gro_cou');
const Major = require('../models/major');
const Payment = require('../models/payment');
const Pay_info = require('../models/pay_info');
const Student = require('../models/student');
const Stu_extracou = require('../models/stu_extracou');
const Teacher = require('../models/teacher');
const Tesine = require('../models/tesine');
const { document_types } = require('../types/dictionaries');

const checkCampusExistence = async (id_campus = 0) => {
    const campus = await Campus.findOne({
        where: { id_campus }
    })
    if (!campus) {
        throw new Error(`El campus con el id ${id_campus} no existe`)
    }

}

    const checkStudentExistence = async (req, res = response, next) => {
        const matricula = req.body.matricula || req.params.matricula
        const student = await Student.findOne({
            where: { matricula }
        })
        if (!student) {
            return res.status(404).json({
                ok: false,
                msg: `El estudiante con matricula ${matricula} no existe`
            })
        }

        req.id_student = student.toJSON()['id_student']
        next();
    }




        
const checkStudentEnroll = async (req, res = respone, next) => {
    const { id_student } = req;
    const enroll_payments = await Pay_info.findAndCountAll({
        where: {
            id_student,
            payment_type: 'Inscripción'
        },
        attributes: { exclude: ['id'] }
    })
    req.enroll = (enroll_payments.count > 0) ? true : false
    // console.log(req.enroll)

    next()
}

const checkEmployeeExistence = async (req, res = response, next) => {
    const id_user = req.body.id_user || req.params.id_user
    const employee = await Employees.findOne({
        where: { id_user }
    })
    if (!employee) {
        return res.status(404).json({
            ok: false,
            msg: `El trabajador con id ${id_user} no existe`
        })
    }

    req.id_employee = employee.toJSON()['id_employee']
    next();
}

const checkDepartmentExistence = async (req, res = response, next) => {
    const id_department = req.params.id_department || req.body.id_department
    const department = await Department.findOne({
        where: {
            id_department: id_department
        }
    });

    if (!department) {
        return res.status(404).json({
            ok: false,
            msg: `El departamento con id ${id_department} no existe`
        })
    }

    next()
}

const checkPaymentExistence = async (req, res = response, next) => {
    const id_payment = req.params.id_payment || req.body.id_payment
    const payment = await Payment.findOne({
        where: {
            id_payment: id_payment
        }
    });

    if (!payment) {
        return res.status(404).json({
            ok: false,
            msg: `El pago con id ${id_payment} no existe`
        })
    }

    next()
}

const checkGroupExistence = async (req, res = response, next) => {
    const { id_group } = req.params
    const group = await Group.findOne({
        where: { id_group }
    });

    if (!group) {
        return res.status(404).json({
            ok: false,
            msg: `El grupo con id ${id_group} no existe`
        })
    }

    next();
}

// Checar que el id de card venga en el req cuando sea necesario
const isValidCard = async (id_card = null, req) => {
    const { payment_method } = req.body
    if ((payment_method.toLowerCase() === 'tarjeta' || payment_method.toLowerCase() === 'depósito')) {
        if (!id_card) throw Error(`La tarjeta a la cual va dirigo el pago es obligatoria.`)
    } else {
        if (id_card || id_card === 0) throw Error(`La tarjeta a la cual va dirigo el pago no es requerida.`)
    }

    return true
}

const checkCardExistence = async (req, res = response, next) => {
    const { id_card } = req.body
    if (id_card != null) {
        const card = await Card.findByPk(id_card);
        if (!card) {
            return res.status(404).json({
                ok: false,
                msg: `La tarjeta con id ${id_card} no existe.`
            })
        }
    }

    next()
}



// Checar que el document_type venga en el req cuando sea necesario
const isValidDocument = (document_type = null, req) => {
    const { payment_type } = req.body
    if (payment_type.toLowerCase() != 'documento') {
        if (document_type || document_type === 0) throw Error(`El tipo de documento no es requerido.`)
    } else {
        if (document_type === null) throw Error(`El tipo de documento es obligatorio.`)
        if (document_type < 0 || document_type >= document_types.length) throw Error(`Tipo de documento invalido`)
    }
    return true
}

const isValidDocumentType = ( document_type = null, req) => {
    if (document_type < 0 || document_type >= document_types.length) throw Error(`Tipo de documento invalido`)
    return true
}

const checkDocumentExistance = ( req, res, next ) => {
    const { id_document } = req.params
    const document = Document.findByPk(id_document)
    if(!document){
        res.status(404).json({
            ok : false,
            msg : `El documento con id ${id_document} no existe.`
        })
    }
    next();
}

const isValidPaymentMethod = ( payment_method= ' ' ) => {
    if(!['tarjeta','depósito','efectivo'].includes(payment_method.toLowerCase())){
        throw Error('Métdodo de pago invalido.')
    }else{
        return true
    }
}
const isValidPaymentType = ( payment_type = ' ' ) => {
    if(!['documento','inscripción','materia'].includes(payment_type.toLowerCase())){
        throw Error('Tipo de pago invalido.')
    }else{
        return true
    }
}

const isValidStartDate = ( start_date ) => {
    if(start_date != null){
        if(start_date < 0 || start_date > 11) throw new Error('Start date inválido')
    }

    return true
}
const isValidEduLevel = ( edu_level ) => {
        if(![1,2].includes(edu_level)) throw new Error('Nivel de eduación inválido')

    return true
}

const checkTeacherExistence = async (req, res = response, next) => {
    const id_teacher = req.body.id_teacher || req.params.id_teacher
    const teacher = await Teacher.findByPk(id_teacher)
    if (!teacher) {
        return res.status(404).json({
            ok: false,
            msg: `El teacher con el id ${id_teacher} no existe`
        })
    }
    next();
}

const checkGraduationCourseExistence = async (req, res = response, next) => {
    const id_graduation_course = req.body.id_graduation_course || req.params.id_graduation_course
    const graduationCourse = await Graduation_courses.findByPk(id_graduation_course)
    if (!graduationCourse) {
        return res.status(404).json({
            ok: false,
            msg: `El curso de graduación con el id ${id_graduation_course} no existe`
        })
    }
    console.log("gce test");
    next();
}

const checkMajorExistence = async (req, res = response, next) => {
    const id_major = req.body.id_major || req.params.id_major
    const major = await Major.findByPk(id_major)
    if (!major) {
        return res.status(404).json({
            ok: false,
            msg: `La carrera con el id ${id_major} no existe`
        })
    }
    next();
}

const checkGradeCourseExistence = async (req, res, next) =>{
    const id_grade = req.body.id_grade || req.params.id_grade
    const grade = await Grades.findByPk(id_grade)
    if(!grade){
        return res.status(404).json({
            ok:false,
            msg:`La calificación con id ${id_grade} no existe`
        })
    }
    next();
}
const checkGradeExtraCurCoureExistence = async (req, res, next) =>{
    const id_stu_extracou = req.body.id_stu_extracou || req.params.id_stu_extracou
    const grade = await Stu_extracou.findByPk(id_stu_extracou)
    if(!grade){
        return res.status(404).json({
            ok:false,
            msg:`La calificación con id ${id_stu_extracou} no existe`
        })
    }
    next();
}
const checkGradeTesineExistence = async (req, res, next) =>{
    const id_tesine = req.body.id_tesine || req.params.id_tesine
    const grade = await Tesine.findByPk(id_tesine)
    if(!grade){
        return res.status(404).json({
            ok:false,
            msg:`La calificación con id ${id_tesine} no existe`
        })
    }
    next();
}

const checkExtraCurCourExistence = async (req, res, next) =>{
    const id_ext_cou = req.body.id_ext_cou || req.params.id_ext_cou
    const extraCurCour = await ExtraCurricularCourses.findByPk(id_ext_cou)
    if(!extraCurCour){
        return res.status(404).json({
            ok:false,
            msg:`El curso extra curricular con id ${id_ext_cou} no existe.`
        })
    }
    next();
}
// De nada, te ahorré trabajo 

const checkGraSecExistence = async (req, res, next) =>{
    const id_graduation_section = req.body.id_graduation_section || req.params.id_graduation_section
    const graSec = await Graduation_section.findByPk(id_graduation_section)
    if(!graSec){
        return res.status(404).json({
            ok:false,
            msg:`La sección del curso de graduación con id ${id_graduation_section} no existe.`
        })
    }
    next();
}
const checkCourseExistence = async (req, res, next) =>{
    const id_course = req.body.id_course || req.params.id_course
    const course = await Course.findByPk(id_course)
    if(!course){
        return res.status(404).json({
            ok:false,
            msg:`El curso con id ${id_course} no existe.`
        })
    }
    next();
}

const checkGroupCourseExistence = async (req, res, next) =>{
    const id_gro_cou = req.body.id_gro_cou || req.params.id_gro_cou
    const gro_cou = await Gro_cou.findByPk(id_gro_cou)
    if(!gro_cou){
        return res.status(404).json({
            ok:false,
            msg:`El curso con id ${id_gro_cou} no existe.`
        })
    }
    next();
}

const checkAssitExistence = async(req, res, next) => {
    const id_assistance = req.body.id_assistance || req.params.id_assistance
    const assit = await Assit.findByPk(id_assistance)
    if(!assit){
        return res.status(404).json({
            ok:false,
            msg:`La asistencia con id ${id_assistance} no existe.`
        })
    }
    next();
}


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
    isValidDocumentType
}