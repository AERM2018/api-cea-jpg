const { Router } = require('express');
const {getAllDepartments,createDepartment,deleteDepartament,updateDepartament} = require('../controllers/departmentController');

const departmentsRouter = Router();

departmentsRouter.get('/', getAllDepartments);
departmentsRouter.post( '/', createDepartment);
departmentsRouter.put( '/:id', updateDepartament);
departmentsRouter.delete( '/:id', deleteDepartament);

module.exports = departmentsRouter;