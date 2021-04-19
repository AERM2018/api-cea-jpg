const { response } = require("express")
const moment = require('moment')
const Document = require("../models/document")
const Payment = require("../models/payment")
const Request = require("../models/request")
const Stu_pay = require("../models/stu_pay")
const { document_types } = require("../types/dictionaries")

const createRequest = async( req, res =  response) => {
    const { document_type, matricula, id_student, id_department } = req.body
    
    
    try {
        
        const doc_info = new Document({ document_type, cost : document_types[document_type]['price']})
        const doc = await doc_info.save()
        const { id_document, cost} = doc.toJSON()
    
        const payment_info = new Payment({
            payment_method : 'Efectivo', // Valor por defecto
            amount : cost,
            payment_type : 'Documento',
            status_payment : 0,
            cutoff_date : moment().local().add(7,'days').toDate(),
            payment_date : null
        })
        const payment = await payment_info.save()
        const { id_payment }  = payment.toJSON()
        
        const stu_pay = new Stu_pay({ id_payment , id_student})
        await stu_pay.save()

        const request = new Request({
            id_department,
            id_document,
            id_payment
        })
    
        await request.save()
    
        return res.status(201).json({
            ok : true,
            msg : "Solcitud creada correctamente"
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            ok : false,
            msg : "Hable con el administrador"
        })
    }
    
    // res.sendStatus(204)
}




module.exports = {
    createRequest
}