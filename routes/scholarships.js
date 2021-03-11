const { Router } = require('express');
const { check } = require('express-validator');
const { getAllScholarships, updateScholarship, createScholarship, deleteScholarship } = require('../controllers/scholarshipsController');
const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const scholarshipRouter = Router();

scholarshipRouter.get( '/', [
    validateJWT
],  getAllScholarships);

scholarshipRouter.post('/',[
    check('id_student','La matricula del estudiante es obligatoria').notEmpty().isString(),
    check('scholarship_name','El nombre de la beca es obligatorio').notEmpty().isString(),
    check('percentage','El porcentaje de la beca es obligatorio y debe ser numero flotante').isFloat().exists({checkNull:true}),
    check('reason','La razon de la beca es obligatoria').notEmpty().isString(),
    validateFields,
    validateJWT
 ],
 createScholarship);

scholarshipRouter.put( '/:id_scholarship',[
    check('id_scholarship','El id de la beca es un numero entero y es obligatorio').notEmpty(),
    check('id_student','La matricula del estudiante es obligatoria').notEmpty().isString(),
    check('scholarship_name','El nombre de la beca es obligatorio').notEmpty().isString(),
    check('percentage','El porcentaje de la beca es obligatorio y debe ser numero con decimales').isFloat().exists({checkNull:true}),
    check('reason','La razon de la beca es obligatoria').notEmpty().isString(),
    validateFields,
    validateJWT
 ],updateScholarship);

scholarshipRouter.delete( '/:id_scholarship', [
    check('id_scholarship','El id de la beca es un numero entero y es obligatorio').isNumeric().exists({checkNull:true}),
    validateFields,
    validateJWT
],deleteScholarship)




module.exports = scholarshipRouter;
// DEDG202103001