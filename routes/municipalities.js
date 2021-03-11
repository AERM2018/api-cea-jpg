const { Router } = require('express');
const { check, param } = require('express-validator');
const { getAllMunicipalities, createMunicipality, updateMunicipality, deleteMunicipality } = require('../controllers/municipalityController');
const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const municipalitiesRouter = Router();

municipalitiesRouter.get('/', [
    validateJWT
],  getAllMunicipalities);

municipalitiesRouter.post( '/', [ 
    check('id_state','El id del estado es obligatorio').isNumeric().exists({ checkNull : true}),
    check('municipality','El nombre del municipio es obligatorio').notEmpty().isString(),
    validateFields,
    validateJWT
],createMunicipality);

municipalitiesRouter.put( '/:id', [ 
    param('id','El id del municipio es obligatorio y debe de ser un numero entero').isNumeric(),
    check('id_state','El id del estado es obligatorio').isNumeric().exists({ checkNull : true}),
    check('municipality','El nombre del municipio es obligatorio').notEmpty().isString(),
    validateFields,
    validateJWT
],updateMunicipality);

municipalitiesRouter.delete('/:id',[
    param('id','El id del municipio es obligatorio y debe de ser un numero entero').isNumeric(),
    validateJWT
],deleteMunicipality)

module.exports = municipalitiesRouter;