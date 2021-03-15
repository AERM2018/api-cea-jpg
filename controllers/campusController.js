const { QueryTypes } = require("sequelize")
const { db } = require("../database/connection")
const Campus = require("../models/campus")
const Municipality = require("../models/municipality")
const { getCampus } =  require('../queries/queries')

const getAllCampus = async (req, res) => {

    const campus = await db.query(getCampus, { type : QueryTypes.SELECT})
    res.status(200).json({
        ok : true,
        campus
    })
}

const createCampus = async (req, res) => {
    const { body } = req;
    const { id_municipality } = body;

    try {

        // Check if the municipality exist
        const municipality = await Municipality.findByPk(id_municipality)
        if (!municipality) {
            return res.status(404).json({
                ok: false,
                msg: `El municipio con id ${id_municipality} no existe`
            })
        }

        //  Create and save course
        const campus = new Campus(body);
        await campus.save();

        res.status(201).json({
            ok: true,
            msg: 'Campus creado correctamente'
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }
}

const updateCampus = async (req, res) => {
    const { id } = req.params
    const { body } = req;

    try {
        // Check if the record exists before updating
        const campus = await Campus.findByPk(id)
        if (!campus) {
            return res.status(404).json({
                ok: false,
                msg: `El municipio con id ${id} no existe, verifiquelo por favor.`
            })
        }

        // Update record in the database
        await Campus.update(body, {
            where: { 'id_campus': id }
        })

        return res.status(200).json({
            ok: true,
            msg: 'Campus actualizado correctamente'
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }
}

const deleteCampus = async (req, res) => {
    const { id } = req.params

    try {
        const campus = await Campus.findByPk(id);

        // Check if the course exists
        if (!campus) {
            return res.status(404).json({
                ok: false,
                msg: `El campus con id ${id} no existe, verifiquelo por favor.`
            })
        }

        // Delete the record of the campus
        await campus.destroy()

        res.status(200).json({
            ok: true,
            msg: 'Campus eliminado correctamente'
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }
}

module.exports = {
    getAllCampus,
    createCampus,
    updateCampus,
    deleteCampus
}
