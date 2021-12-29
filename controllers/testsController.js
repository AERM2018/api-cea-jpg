const { Op, literal } = require("sequelize");
const moment = require('moment');
const { printAndSendError } = require("../helpers/responsesOfReq");
const Grades = require("../models/grades");
const Gro_cou = require("../models/gro_cou");
const Stu_gro = require("../models/stu_gro");
const Test = require("../models/test");
const getTestInfo = require("../helpers/tests");

const assignTestToStudent = async(req, res) => {
    const {id_student} =  req
    const {application_date,id_course} = req.body
    try {
        const {id_group} = await Stu_gro.findOne({
            where : {id_student},
            attributes : ['id_group'],
            raw : true
        })
        const {id_gro_cou} = await Gro_cou.findOne({ 
            where : {[Op.and]:[{id_group},{id_course}]},
            attributes : ['id_gro_cou'],
            raw : true
        })
        const {folio:lastFolio} = await Test.findOne({attributes:['folio'],order:[['folio','DESC']],raw:true}) || 1
        const {id_grade} = await Grades.findOne({
            where : {[Op.and]:[{id_student},{id_course}]},
            attributes : ['id_grade'],
            raw : true
        })
        const test = await Test.update({folio : lastFolio + 1,type:'Extraordinario',application_date,assigned_test_date : moment().format('YYYY-MM-DD'),applied:false},{where : {id_grade}})
        return res.json({
            ok : true,
            msg : 'Examen asignado correctamente.'
        });
    } catch (error) {
        printAndSendError(res,error)
    }
}

const getTests = async(req, res) => {
    // const tests = await getTestInfo(true,{id_group:5,id_course:12})
    const tests = await getTestInfo()
    res.json({
        ok : true,
        tests
    })
}
module.exports = {
    assignTestToStudent,
    getTests
};
