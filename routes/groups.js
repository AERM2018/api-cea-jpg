const { Router } = require('express');
const { check, param } = require('express-validator');
const {getAllGroups,createGroup,updateGroup,deleteGroup} = require('../controllers/groupsController');
const { validateFields } = require('../middlewares/validateFields');

const groupsRouter = Router();

groupsRouter.get('/', getAllGroups);

groupsRouter.post( '/',[
    check('id_major','el id de la cerrera es obligatorio y tiene que ser numerico').notEmpty().isNumeric(),
    check('name_group','el nombre del grupo es obligaotorio').notEmpty().isString(),
    check('entry_year','el año de entrada es obligatorio').notEmpty().isDate(),
    check('end_year','el año de salida es obligatorio').notEmpty().isDate(),
    check('day', 'el dia es obligatorio').notEmpty().isInt(),
    check('start_hour', 'la hora de inicio es obligatoria').notEmpty(),
    check('finish_hour','la hora de fin es obligatoria').notEmpty(),
    validateFields
    
], createGroup);

groupsRouter.put( '/:id',[
    param('id','el id del grupo tiene que ser un numero').isNumeric(),
    check('name_group','el nombre del grupo es obligaotorio').notEmpty().isString(),
    check('entry_year','el año de entrada es obligatorio').notEmpty().isDate(),
    check('end_year','el año de salida es obligatorio').notEmpty().isDate(),
    validateFields

], updateGroup);

groupsRouter.delete( '/:id',[
    param('id','el id del grupo tiene que ser un numero').isNumeric(),
    validateFields

], deleteGroup);

module.exports = groupsRouter;