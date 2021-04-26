const moment = require('moment')
const Document = require("../models/document")
const Payment = require("../models/payment")
const Request = require("../models/request")
const Stu_pay = require("../models/stu_pay")
const Req_pay = require('../models/req_pay')
const Student = require('../models/student')
const { QueryTypes, where } = require('sequelize');
const { getStuInfo } = require('../queries/queries');
const { db } = require('../database/connection');
const { document_types } = require("../types/dictionaries")

const getAllTheRequests = async (req, res) => {
    // TODO: calarlo 
    try {
        const { fecha = moment().local().format("YYYY-MM-DD") } = req.query;
        //const { fecha = Date.now() } = req.query;
        
        const { status = 0 } = req.query;
        const estado = status ? 'finalizado' : 'no finalizada'
        
        const requests = await Request.findAll({
            where: {
                creation_date: fecha,
                status_request: status
            }
        });
        if (!requests) {
            return res.status(400).json({
                ok: false,
                msg: "No existen peticiones de la fecha " + fecha + 'con el estado ' + estado
            })
        }
      
        const responseRequest = await Promise.all(requests.map(async (request) => {
            
            const { id_payment, id_document, id_department, id_request, creation_date } = request
           

            const {id_student} = await Stu_pay.findOne({
                where: { id_payment }
            })

            const [student] = await db.query(getStuInfo, { replacements: { id: id_student }, type: QueryTypes.SELECT })
            const req_pay = await Req_pay.findOne({
                where: { id_request }
            })

            return {
                    request,
                    student,
                    id_department,
                    req_pay,
                    id_document
            }
        }))

        return res.status(201).json({
            ok: true,
            data: responseRequest
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador"
        })
    }
}

const createRequest = async (req, res) => {
    const { document_type, matricula, id_department, id_student } = req.body
    try {
        

        const doc_info = new Document({ document_type, cost: document_types[document_type]['price'] })
        const doc = await doc_info.save()
        const { id_document, cost } = doc.toJSON()

        const payment_info = new Payment({
            payment_method: 'Efectivo', // Valor por defecto
            amount: cost,
            payment_type: 'Documento',
            status_payment: 0,
            cutoff_date: moment().endOf('month').local().format("YYYY-MM-DD").toString(),
            payment_date: null,
            start_date: moment().startOf('month').local().format("YYYY-MM-DD").toString(),

        })
        const payment = await payment_info.save()
        const { id_payment } = payment.toJSON()

        const stu_pay = new Stu_pay({ id_payment, id_student });
        await stu_pay.save();

        const request = new Request({
            id_department,
            id_document,
            id_payment,
        })

        await request.save()

        return res.status(201).json({
            ok: true,
            msg: "Solcitud creada correctamente"
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador"
        })
    }
}
const completeARequest = async (req, res)=>{

    const { id } = req.params;
    try {
        const request = await Request.findOne({
            where: {id_request: id}
        })
        if (request.status_request){
            return res.status(500).json({
                ok: false,
                msg: "Ya esta completada esta tarea"
            })
        }
        await request.update({
            status_request: 1
        })
        // TODO: AQUI HACER VALIDACION SI YA SE PAGO O PURA MERMA
        const {id_payment} = request
        const payment  = await Payment.findByPk(id_payment)
        if (payment.status_payment){
            
            return res.status(200).json({
                ok: true,
                msg: `La solicitud se completo correctamente, pero el pago todavia no se ha completado`
            })
        }
        res.status(200).json({
            ok: true,
            msg: `La solicitud se completo correctamente`
        })
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador"
        })
    }
}

const deleteRequest = async  (req, res) => {
    const {id} = req.params;
    
    try {
        const request = await Request.findByPk(id);
        if (!request){
            return res.status(400).json({
                ok: false,
                msg: "No existe la peticion con el id "+ id
            })
        }
        const { id_document, id_payment }= request;
        await request.destroy()
        const document = await Document.findByPk(id_document);
        await document.destroy();
        const stu_pay = await  Stu_pay.findOne({
            where : {id_payment}
        });
        await stu_pay.destroy();
        const payment = await Payment.findByPk(id_payment);
        await payment.destroy();

        res.status(200).json({
            ok: true,
            msg: "La peticion se elimino correctamente",
            
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador"
        })
    }
}



module.exports = {
    createRequest,
    getAllTheRequests,
    completeARequest,
    deleteRequest

}