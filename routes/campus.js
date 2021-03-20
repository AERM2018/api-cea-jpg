const { Router } = require('express');
const { check, param } = require('express-validator');
const { getAllCampus, createCampus, updateCampus, deleteCampus } = require('../controllers/campusController');
const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const campusRouter = Router();

campusRouter.get('/', [
    validateJWT
], getAllCampus);

campusRouter.post('/', [
    check('campus_name','El nombre del campus es obligatorio y debe de tener como máximo 100 caracteres').not().isEmpty().isLength( { max : 100} ),
    check('address','La dirección del campus es obligatorio y debe de tener como máximo 100 caracteres').not().isEmpty().isLength( { max : 100} ),
    check('state','El estado donse se encuentra el campus es obligatorio y debe de tener como máximo 50 caracteres').not().isEmpty().isLength( { max : 50} ),
    check('municipality','El municipio donde se encuentra el campus es obligatorio y debe de tener como máximo 50 caracteres').not().isEmpty().isLength( { max : 50} ),
    validateFields,
    validateJWT
] ,createCampus);

campusRouter.put('/:id',[
    param('id','El id del campus es obligatorio y debe der ser numero entero ').isNumeric(),
    check('campus_name','El nombre del campus es obligatorio y debe de tener como máximo 100 caracteres').not().isEmpty().isLength( { max : 100} ),
    check('address','La dirección del campus es obligatorio y debe de tener como máximo 100 caracteres').not().isEmpty().isLength( { max : 100} ),
    check('state','El estado donse se encuentra el campus es obligatorio y debe de tener como máximo 50 caracteres').not().isEmpty().isLength( { max : 50} ),
    check('municipality','El municipio donde se encuentra el campus es obligatorio y debe de tener como máximo 50 caracteres').not().isEmpty().isLength( { max : 50} ),
    validateFields,
    validateJWT
],
updateCampus);

campusRouter.delete( '/:id', [
    param('id','El id del campus es obligatorio y debe der ser numero entero ').isNumeric(),
    validateJWT
],deleteCampus)


module.exports = campusRouter;