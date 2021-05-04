
const Stu_pay = require("../models/stu_pay")
const Req_pay = require('../models/req_pay')
const { QueryTypes, where } = require('sequelize');
const { getStuInfo, getGradesByStudent } = require('../queries/queries');
const { db } = require('../database/connection');
const Request = require('../models/request')
const { document_types } = require("../types/dictionaries")
const { printAndSendError } = require('../helpers/responsesOfReq')
const getInfoDocument = async (req, res) => {
    const { id } = req.params;
    try {
        const request = await Request.findByPk(id);
        if (!request) {
            return res.status(404).json({
                ok: false,
                msg: "No existe una peticion con el id " + id,
            });
        }
        console.log(request)
        const { id_document, id_request, id_payment } = request

        const {id_student} = await Stu_pay.findOne({
            where: { id_payment }
        })

        const [student] = await db.query(getStuInfo, { replacements: { id: id_student }, type: QueryTypes.SELECT })
        const { name } = await Req_pay.findOne({
            where: { id_request }
        })
        const [grades] = await db.query(getGradesByStudent, { replacements: { id_student, id_group: student.id_group }, type: QueryTypes.SELECT })
        if (name != 0) {

            return res.status(200).json({
                ok: true,
                student,
                id_student,
                id_document,
                name:document_types[name]['name']

            })
        }
        else {

            return res.status(200).json({
                ok: true,
                student,
                id_student,
                id_document,
                grades,
                name:document_types[name]['name']



            })

        }




    } catch (error) {
        printAndSendError(res, error);
    }
}
module.exports = {
    getInfoDocument
}