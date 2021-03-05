const { response } = require("express")
const Scholarship = require("../models/scholarship")
const { db } = require('../database/connection')
const { QueryTypes } = require('sequelize');

const getAllScholarships = async( req, res = response ) => {
    try {
        const scholarships = await Scholarship.findAll({
            attributes : {
                exclude : ['id','createdAt','updatedAt']
            }
        })

        res.status(200).json({
            ok : true,
            scholarships
        })
    } catch ( err ) {
        console.log(err)
        return res.status(500).json({
            msg : "Hable con el administrador"
        })
    }
}


const createScholarship = async( req, res = response ) => {
    const { body } = req;
    const { id_student } = body;

    try {
        //Modificar una vez tenga el modelo student
        const student = await db.query(`SELECT * FROM students WHERE id_student = :id`,{replacements:{id:id_student},type:QueryTypes.SELECT});
        if(student.length < 1){
            return res.status(404).json({
                ok : false,
                msg : `El estudiante con id ${id_student} no existe, verifiquelo por favor.`
            });
        }
    
        const scholarship = new Scholarship(body);
        await scholarship.save();
    
        res.status(201).json({
            ok : true,
            msg : 'La beca se creo correctamente.'
        })
    } catch ( err) {
        console.log(err)
        res.status(500).json({
            ok : false,
            msg : 'Hable con el adminstrador.'
        })
    }

}


const updateScholarship = async( req, res = response ) => {
    const { id_scholarship } = req.params
    const { body } = req;
    const { id_student } = body;

    try {

        const scholarship = await Scholarship.findByPk(id_scholarship);
        if(!scholarship){
            return res.status(404).json({
                ok : false,
                msg : `La beca con id ${id_scholarship} no existe, verifiquelo por favor.`
            });
        }

        if( scholarship.toJSON().id_student != id_student){
            //Modificar una vez tenga el modelo student
            const [student] = db.query(`SELECT * FROM students WHERE id_student = ${id_student}`);
            if(student.length < 1){
                return res.status(404).json({
                    ok : false,
                    msg : `El estudiante con id ${id_student} no existe, verifiquelo por favor.`
                });
            }
        }
    
        await Scholarship.update(body,{where:{'id_scholarship':id_scholarship}})
        res.status(200).json({
            ok : true,
            msg : 'La beca se actualizo correctamente.'
        })
    } catch ( err) {
        console.log(err)
        res.status(500).json({
            ok : false,
            msg : 'Hable con el adminstrador.'
        })
    }
}

const deleteScholarship = async( req, res = response ) => {
    const { id_scholarship } = req.params
    try {
        const scholarship = await Scholarship.findByPk(id_scholarship);
        if(!scholarship){
            return res.status(404).json({
                ok : false,
                msg : `La beca con id ${id_scholarship} no existe, verifiquelo por favor.`
            });
        }

        await scholarship.destroy();

        res.status(200).json({
            ok : true,
            msg : 'La beca se eliminó correctamente.'
        })
    } catch ( err ) {
        console.log(err)
        res.status(500).json({
            ok : false,
            msg : 'Hable con el adminstrador.'
        })
    }
}

module.exports = {
    getAllScholarships,
    createScholarship,
    updateScholarship,
    deleteScholarship
}