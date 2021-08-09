const moment = require('moment')
const Document = require("../models/document")
const Payment = require("../models/payment")
const Request = require("../models/request")
const Stu_pay = require("../models/stu_pay")
const Req_pay = require('../models/req_pay')
const Student = require('../models/student')
const { QueryTypes, where,fn,col } = require('sequelize');
const { getStuInfo } = require('../queries/queries');
const { db } = require('../database/connection');
const { document_types } = require("../types/dictionaries")
const Partial_pay = require('../models/partial_pay')
moment().locale('es')
const getAllTheRequests = async (req, res) => {
    try {
        let { date = moment().local().format("YYYY-MM-DD"), status = 0} = req.query;
        let requests;
        const estado = status ? 'finalizado' : 'no finalizada'
        let condition;
        condition = (date === 'all') 
            ? {
                status_request: status
            }
            :{
                creation_date: date,
                status_request: status
            }

            Request.belongsTo(Payment,{ foreignKey : 'id_payment'})
            Payment.hasOne(Request,{ foreignKey : 'id_payment'})

            Request.belongsTo(Document,{ foreignKey : 'id_document'})
            Document.hasOne(Request,{ foreignKey : 'id_document'})

            Stu_pay.belongsTo(Payment,{ foreignKey : 'id_payment'})
            Payment.hasOne(Stu_pay,{ foreignKey : 'id_payment'})

            Stu_pay.belongsTo(Student,{ foreignKey : 'id_student'})
            Student.hasMany(Stu_pay,{ foreignKey : 'id_student'})

            requests = await Request.findAll({
                include : [{
                   model : Payment,
                   include : {
                       model : Stu_pay,
                       include : {
                           model : Student,
                           attributes : [[fn('concat',col('name')," ",col('surname_f')," ",col('surname_m')),'student_name'],'matricula','id_student']
                       }
                   }
                },{
                    model : Document,
                    attributes : ['document_type']
                }],
                where : condition,
                attributes : {
                    exclude : ['id_document','id_payment','id_department']
                }
            })


        if (!requests) {
            return res.status(400).json({
                ok: false,
                msg: "No existen peticiones de la fecha " + date + 'con el estado ' + estado
            })
        }

        requests = requests.map( request => {
            const {payment,document,...restoRequest} = request.toJSON();
            return {
                ...restoRequest,
                creation_date : moment(restoRequest.creation_date).format('D,MMMM,YYYY'),
                ...payment.stu_pay.student,
                document_name : document_types[document.document_type].name
            }
        })
      
        // const responseRequest = await Promise.all(requests.map(async (request) => {
            
        //     const { id_payment, id_document, id_department, id_request, creation_date } = request
           

        //    //const {id_student} = await Stu_pay.findOne({
        //    //    where: { id_payment }
        //    //})

        //     //const [student] = await db.query(getStuInfo, { replacements: { id: id_student }, type: QueryTypes.SELECT })
        //     const {status_payment,name,cost} = await Req_pay.findOne({
        //         where: { id_request }
        //     })

        //     return {
        //             request,
        //             //student,
        //             //id_department,
        //             status_payment,
        //             name:document_types[name]['name'],
        //             cost
        //             //id_document
        //     }
        // }))

        return res.status(200).json({
            ok: true,
            requests
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
            payment_type: 'Documento',
            status_payment: 0,
            cutoff_date: moment().endOf('month').local().format("YYYY-MM-DD").toString(),
            payment_date: null,
            amount: cost,
            start_date: moment().startOf('month').local().format("YYYY-MM-DD").toString(),

        })
        const payment = await payment_info.save()
        const { id_payment } = payment.toJSON()

        const stu_pay = new Stu_pay({ id_payment, id_student });
        await stu_pay.save();

        const partial_pay = new Partial_pay({
            id_payment,
            id_card:null,
            amount_p: 0,
            payment_method : 'Efectivo',
            date_p: moment().local().format().substr(0, 10),
          });

        await partial_pay.save();
        
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
            return res.status(400).json({
                ok: false,
                msg: "La petición ya esta completada."
            })
        }
        await request.update({
            status_request: 1
        })
        
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
        await Partial_pay.destroy({
            where : {id_payment}
        })
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