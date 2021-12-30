const { Router } = require('express');
const { check, param } = require('express-validator');
const { getAllExtraCurricularCourses, createExtraCurricularCourse, updateExtraCurricularCourse, deleteExtraCurricularCourse, getStudentsFromExtraCourse, getStudentFromExtraCour, StudentFromExtraCour} = require('../controllers/extracurricularcoursesController');
const { checkMajorExistence, checkTeacherExistence, checkExtraCurCourExistence } = require('../middlewares/dbValidations');
const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const extraCurricularCoursesRouter = Router();

extraCurricularCoursesRouter.get('/',[
    validateJWT
], getAllExtraCurricularCourses);

extraCurricularCoursesRouter.get('/:id_ext_cou/students',[

],getStudentsFromExtraCourse);

extraCurricularCoursesRouter.post('/', [
    check('id_major','id_major es campo tipo integer, obligatorio').isInt().not().isEmpty(),
    check('ext_cou_name','ext_cou_name es campo de tipo string máximo de 15 carácteres, obligatorio').isString().not().isEmpty().isLength( { max: 15 } ),
    check('start_date','start_date es campo de tipo DATE con fromato YYYY-MM-DD, es obligatorio').isDate().not().isEmpty(),
    check('finish_date','finish_date es campo de tipo DATE con fromato YYYY-MM-DD, puede ser nulo').isDate(),
    check('limit_participants','limit_participants es campo de tipo tinyint, obligatorio').isNumeric().not().isEmpty(),
    check('cost','cost requiere tipo de dato float, es obligatorio').isFloat().not().isEmpty(),
    check('id_teacher','id_teacher es tipo string máximo de 30 carácteres, es obligatorio').isString().not().isEmpty().isLength( { max: 30 } ),
    checkMajorExistence,
    checkTeacherExistence,
    validateFields,
    validateJWT
],createExtraCurricularCourse);

extraCurricularCoursesRouter.put('/:id_ext_cou',[
    param('id_ext_cou','id_ext_cou es llave primaria de tipo integer').not().isEmpty().isInt(),
    check('id_major','id_major es campo tipo integer, obligatorio').isInt().not().isEmpty(),
    check('ext_cou_name','ext_cou_name es campo de tipo string máximo de 15 carácteres, obligatorio').isString().not().isEmpty().isLength( { max: 15 } ),
    check('start_date','start_date es campo de tipo DATE con fromato YYYY-MM-DD, es obligatorio').isDate().not().isEmpty(),
    check('finish_date','finish_date es campo de tipo DATE con fromato YYYY-MM-DD, puede ser nulo').isDate(),
    check('limit_participants','limit_participants es campo de tipo tinyint, obligatorio').isNumeric().not().isEmpty(),
    check('cost','cost requiere tipo de dato float, es obligatorio').isFloat().not().isEmpty(),
    check('id_teacher','id_teacher es tipo string máximo de 30 carácteres, es obligatorio').isString().not().isEmpty().isLength( { max: 30 } ),
    validateFields,
    validateJWT
], updateExtraCurricularCourse);

extraCurricularCoursesRouter.delete('/:id_ext_cou',[
    param('id_ext_cou','id_ext_cou es llave primaria de tipo integer').isInt(),
    validateJWT
], deleteExtraCurricularCourse);

module.exports= extraCurricularCoursesRouter;