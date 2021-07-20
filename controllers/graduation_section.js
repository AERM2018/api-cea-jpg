const { response } = require("express");
const { db } = require("../database/connection")

const getAllGraduation_Sections = async (req, res = response) => {
    // const courses = await db.query(
    //     getCourses,{ type : QueryTypes.SELECT}
    // )
    
    
    // res.status(200).json({
    //     ok: true,
    //     courses
    // })
}

const createGraduation_Sections = async (req, res = responde ) =>{

}
const updateGraduation_Sections = async (req, res = responde ) =>{
    
}
const deleteGraduation_Sections = async (req, res = responde ) =>{
    
}

module.exports = {
    getAllGraduation_Sections,
    createGraduation_Sections,
    updateGraduation_Sections,
    deleteGraduation_Sections
}