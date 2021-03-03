const { Router } = require('express');
const { check } = require('express-validator');
const { getAllMunicipalities, createMunicipality, updateMunicipality, deleteMunicipality } = require('../controllers/municipalityController');
const { validateFields } = require('../middlewares/validateFields');

const municipalitiesRouter = Router();

municipalitiesRouter.get('/', getAllMunicipalities);

municipalitiesRouter.post( '/', [ 
    check('id_state','El id del estado es obligatorio').isNumeric(),
    check('municipality','El nombre del municipio es obligatorio').notEmpty(),
    validateFields
],createMunicipality);

municipalitiesRouter.put( '/:id', [ 
    check('id_state','El id del estado es obligatorio').isNumeric(),
    check('municipality','El nombre del municipio es obligatorio').notEmpty(),
    validateFields
],updateMunicipality);

municipalitiesRouter.delete('/:id',deleteMunicipality)

module.exports = municipalitiesRouter;