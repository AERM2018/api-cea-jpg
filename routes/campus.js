const { Router } = require('express');
const { getAllCampus } = require('../controllers/campusController');

const campusRouter = Router();

campusRouter.get('/', getAllCampus)


module.exports = campusRouter;