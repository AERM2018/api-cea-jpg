const { Router } = require('express');
const { getAllScholarships, updateScholarship, createScholarship, deleteScholarship } = require('../controllers/scholarshipsController');

const scholarshipRouter = Router();

scholarshipRouter.get( '/', getAllScholarships);

scholarshipRouter.post('/', createScholarship);

scholarshipRouter.put( '/:id_scholarship', updateScholarship);

scholarshipRouter.delete( '/:id_scholarship', deleteScholarship)




module.exports = scholarshipRouter;
// DEDG202103001