const { Router } = require('express');
const { getAllMunicipalities } = require('../controllers/municipalityController');

const municipalitiesRouter = Router();

municipalitiesRouter.get('/', getAllMunicipalities);

module.exports = municipalitiesRouter;