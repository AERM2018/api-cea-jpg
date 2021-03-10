const { Router } = require('express');
const { check } = require('express-validator');
const { getAllScholarships, updateScholarship, createScholarship, deleteScholarship } = require('../controllers/scholarshipsController');
const { validateFields } = require('../middlewares/validateFields');

const scholarshipRouter = Router();

scholarshipRouter.get( '/', getAllScholarships);

scholarshipRouter.post('/',[
    check('id_student','La matricula del estudiante es obligatoria').notEmpty(),
    check('scholarship_name','El nombre de la beca es obligatorio').notEmpty(),
    check('percentage','El porcentaje de la beca es obligatorio y debe ser numero flotante').isFloat(),
    check('reason','La razon de la beca es obligatoria').notEmpty(),
    validateFields
 ],
 createScholarship);

scholarshipRouter.put( '/:id_scholarship',[
    check('id_scholarship','El id de la beca es un numero entero y es obligatorio').isNumeric().notEmpty(),
    check('id_student','La matricula del estudiante es obligatoria').notEmpty(),
    check('scholarship_name','El nombre de la beca es obligatorio').notEmpty(),
    check('percentage','El porcentaje de la beca es obligatorio y debe ser numero con decimales').isFloat().notEmpty(),
    check('reason','La razon de la beca es obligatoria').notEmpty(),
    validateFields
 ],updateScholarship);

scholarshipRouter.delete( '/:id_scholarship', [
    check('id_scholarship','El id de la beca es un numero entero y es obligatorio').isNumeric().notEmpty(),
    validateFields
],deleteScholarship)




module.exports = scholarshipRouter;
// DEDG202103001