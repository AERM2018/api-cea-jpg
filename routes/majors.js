const { Router } = require('express');
const { check, param } = require('express-validator');
const {getAllMajors,deleteMajor,updateMajor,createMajor} = require('../controllers/majorController');
const { validateFields } = require('../middlewares/validateFields');

const majorsRouter = Router();

majorsRouter.get('/', getAllMajors);
majorsRouter.post( '/', [
    check('major_name','el nombre de la carrera es obligatario').notEmpty().isString(),
    validateFields

] ,createMajor);
majorsRouter.put( '/:id', [
    param('id','el id de la carrera tiene que ser un numero').isNumeric(),
    check('major_name','el nombre de la carrera es obligatario').notEmpty().isString(),
    validateFields

] , updateMajor);

majorsRouter.delete( '/:id',[
    param('id','el id de la carrera tiene que ser un numero').isNumeric(),
    validateFields
], deleteMajor);

module.exports = majorsRouter;