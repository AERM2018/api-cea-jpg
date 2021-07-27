const { Router } = require('express');
const { takeCourseAssistance } = require('../controllers/assitsController');

const assitsRouter = Router()

assitsRouter.post('/courses/:id_course', takeCourseAssistance)

module.exports = assitsRouter;
