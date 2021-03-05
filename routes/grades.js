const { Router } = require('express');
const { getAllGradesByCourse } = require('../controllers/gradesController');

const gradesRouter = Router();

gradesRouter.get( '/:id_course', getAllGradesByCourse);

gradesRouter.post('/:id_course', );

gradesRouter.put( '/:id_course', );

gradesRouter.delete( '/:id_course', )




module.exports = gradesRouter;
// DEDG202103001