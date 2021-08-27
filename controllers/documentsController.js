
const Stu_pay = require("../models/stu_pay")
const Req_pay = require('../models/req_pay')
const { QueryTypes, where, fn, col } = require('sequelize');
const { getStuInfo, getGradesByStudent } = require('../queries/queries');
const { db } = require('../database/connection');
const Request = require('../models/request')
const { document_types } = require("../types/dictionaries")
const { printAndSendError } = require('../helpers/responsesOfReq');
const { getGradesStudent, getCourseStudentIsTaking } = require("../helpers/students");
const Document = require("../models/document");
const Student = require("../models/student");
const getInfoDocument = async (req, res) => {
    const { document_type } = req.body;
    const { id_student } = req
    try {
        
        const [student] = await db.query(getStuInfo, { replacements: { id: id_student }, type: QueryTypes.SELECT })
        
        // const [grades] = await db.query(getGradesByStudent, { replacements: { id_student, id_group: student.id_group }, type: QueryTypes.SELECT })
        grades = await getGradesStudent(id_student)
        course = await getCourseStudentIsTaking(student.id_group)
        let info = {}
        info = (document_type != 0)
        ? {
            ...student,
            ...course,
            document_name:document_types[document_type]['name']
        }
        : {
                ...student,
                ...course,
                document_name:document_types[document_type]['name'],
                grades
        }

        return res.status(200).json({
            ok :true,
            info
        })
        // if (document_type != 0) {

        //     return res.status(200).json({
        //         ok: true,
        //         ...student,
        //         document_name:document_types[document_type]['name']

        //     })
        // }
        // else {

        //     return res.status(200).json({
        //         ok: true,
        //         ...student,
        //         document_name:document_types[document_type]['name'],
        //         grades


        //     })

        // }




    } catch (error) {
        printAndSendError(res, error);
    }
}

const createDocument = async(req, res) => {
    const { document_type } = req.body
    const { id_student } = req

    const document = new Document({document_type,cost : document_types[document_type]['price'],id_student,date : moment().format('YYYY-MM-DD').toString()})
    await document.save();

    res.json({
        ok : true,
        msg : "El documento fue creado correctamente."
    })
}

const getDocuments = async( req, res) => {

    Document.belongsTo(Student,{ foreignKey : 'id_student'});
    Student.hasMany(Document, { foreignKey : 'id_student'});

    let documents = await Document.findAll({
        include : {
            model : Student,
            attributes : ['id_student','matricula',[fn('concat',col('name')," ",col('surname_f')," ",col('surname_m')),'student_name']]
        }
    });

    documents = documents.map( doc => {
        const {student, ...restoDoc} = doc.toJSON()
        return {
            ...restoDoc,
            document_name : document_types[restoDoc.document_type]['name'],
            ...student,
        }
    })
    res.json({
        ok : true,
        documents
    })
}
module.exports = {
    getInfoDocument,
    createDocument,
    getDocuments
}