const moment = require('moment');
const { fn, col } = require("sequelize");
const Document = require("../models/document");
const Payment = require("../models/payment");
const Request = require("../models/request");
const Student = require("../models/student");
const Stu_pay = require("../models/stu_pay");
const { document_types } = require('../types/dictionaries');

const getRequests = async(opts={matricula:'',status:0,date:''}) => {
    const {matricula,status='all',date='all'} = opts
    let requests;
    const estado = status ? 'finalizado' : 'no finalizada'
    let condition = {};
    if(date != 'all' ) condition.creation_date = date
    if(status != 'all') condition.status_request = status

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
               required: true,
               include : {
                   model : Stu_pay,
                   required: true,
                   include : {
                       model : Student,
                       attributes : [[fn('concat',col('name')," ",col('surname_f')," ",col('surname_m')),'student_name'],'matricula','id_student'],
                       where:{...(matricula)?{matricula}:{}},
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
        return requests.length > 0 ? requests.map( request => {
            const {payment:{stu_pay:{student}},document,...restoRequest} = request.toJSON();
            return {
                ...restoRequest,
                creation_date : moment(restoRequest.creation_date).format('D,MMMM,YYYY'),
                ...student,
                document_type : document.document_type,
                document_name : document_types.find( documentType => documentType.id === document.document_type)
            }
        }) : []
}

module.exports = {
    getRequests
};
