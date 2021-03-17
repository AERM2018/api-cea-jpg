const { Router } = require('express');
const { check, param } = require('express-validator');
const {getAllMajors,deleteMajor,updateMajor,createMajor} = require('../controllers/majorController');
const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const majorsRouter = Router();

majorsRouter.get('/', [
    validateJWT
], getAllMajors);
majorsRouter.post( '/', [
    check('major_name','el nombre de la carrera es obligatario y tiene que tener como maximo 30 caracteres').not().isEmpty().length({max:30}),
    validateFields,
    validateJWT

] ,createMajor);
majorsRouter.put( '/:id', [
    param('id','el id de la carrera es obligatorio y debe de ser un numero entero').isNumeric(),
    check('major_name','el nombre de la carrera es obligatario y tiene que tener como maximo 30 caracteres').not().isEmpty().length({max:30}),
    validateFields,
    validateJWT

] , updateMajor);

majorsRouter.delete( '/:id',[
    param('id','el id de la carrera es obligatorio y debe de ser un numero entero').isNumeric(),
    validateFields,
    validateJWT
], deleteMajor);

module.exports = majorsRouter;