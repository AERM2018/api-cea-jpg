const { Router } = require('express');
const { check } = require('express-validator');
const { getAllCampus, createCampus, updateCampus, deleteCampus } = require('../controllers/campusController');
const { validateFields } = require('../middlewares/validateFields');

const campusRouter = Router();

campusRouter.get('/', getAllCampus);

campusRouter.post('/', [
    check('id_municipality', 'El id de municipio es numero y es obligatorio').isNumeric(),
    check('campus_name','El nombre del campus es obligatorio').not().isEmpty(),
    check('address','La dirección del campus es obligatorio').not().isEmpty(),
    validateFields
] ,createCampus);

campusRouter.put('/:id',[
    check('id_municipality', 'El id de municipio es numero y es obligatorio').isNumeric(),
    check('campus_name','El nombre del campus es obligatorio').not().isEmpty(),
    check('address','La dirección del campus es obligatorio').not().isEmpty(),
    validateFields
],
updateCampus);

campusRouter.delete( '/:id', deleteCampus)


module.exports = campusRouter;