
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
const moment = require('moment');
const { generateNewDoc } = require("../helpers/documentGeneration");
const { response } = require("express");
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

const createDocument = async(req, res = response) => {
    const stream = res.writeHead(200,{
        'Content-Type':'application/pdf',
        'Content-Disposition':'inline'
    });
    generateNewDoc(
        (chunk) => { stream.write(chunk)},
        () => stream.end()
    )
}

const getDocuments = async( req, res) => {

    Document.belongsTo(Student,{ foreignKey : 'id_student'});
    Student.hasMany(Document, { foreignKey : 'id_student'});

    Request.belongsTo(Document, { foreignKey : 'id_document'})
    Document.hasOne(Request, { foreignKey : 'id_document'})

    let documents = await Document.findAll({
        include : [{
            model : Student,
            attributes : ['id_student','matricula',[fn('concat',col('name')," ",col('surname_f')," ",col('surname_m')),'student_name']]
        },{
            model : Request
        }]
    });

    documents = documents.map( doc => {
        const {student, request, ...restoDoc} = doc.toJSON()
        let docToReturn = {
            ...restoDoc,
            document_name : document_types[restoDoc.document_type]['name'],
            ...student,
        }
        docToReturn = (request) ? {...docToReturn,belongsToARequest:true} : {...docToReturn,belongsToARequest:false}
        return docToReturn
    })
    res.json({
        ok : true,
        documents
    })
}

const deleteDocument = async(req, res) => {
    const { id_document } = req.params

    Request.belongsTo(Document, { foreignKey : 'id_document'})
    Document.hasOne(Request, { foreignKey : 'id_document'})
    const document = await Document.findByPk(id_document,{
        include : {
            model : Request
        }
    })

    if(document.request){
        return res.status(400).json({
            ok : false,
            msg : `El documento con id ${id_document} no pudo ser eliminado debido a que esta asociado con una petición.`
        })
    }
    await document.destroy();

    return res.json({
        ok : true,
        msg : "El documento fue eliminado correctamente."
    })
}
module.exports = {
    getInfoDocument,
    createDocument,
    getDocuments,
    deleteDocument
}