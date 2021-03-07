const { Router } = require('express');
const { getAllTeachers,createTeacher,updateTeacher,deleteTeacher} = require('../controllers/teacherController');

const teachersRouter = Router();

teachersRouter.get('/', getAllTeachers);
teachersRouter.post('/', createTeacher);
teachersRouter.put('/:id', updateTeacher);
teachersRouter.delete('/:id', deleteTeacher);

module.exports = teachersRouter;