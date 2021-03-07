const { Router } = require('express');
const { getAllStudents,createStudent,updateStudent,deleteStudent } = require('../controllers/studentController');

const studentsRouter = Router();

studentsRouter.get('/', getAllStudents);
studentsRouter.post('/', createStudent);
studentsRouter.put('/:id', updateStudent);
studentsRouter.delete('/:id', deleteStudent);

module.exports = studentsRouter;