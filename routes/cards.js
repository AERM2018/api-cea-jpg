const { Router } = require('express');
const { check, param } = require('express-validator');
const { getAllCards, createCard,updateCard, deleteCard } = require('../controllers/cardsController');

const validateJWT = require('../middlewares/validar-jwt');
const { validateFields } = require('../middlewares/validateFields');

const cardsRouter = Router();

cardsRouter.get('/',[
    validateJWT
], getAllCards);

cardsRouter.post('/', [
    // check('id_card','').not.isEmpty.isLength( { max:  } ),
   
    check('card_number','El número de tarjeta es obligatorio y debe tener como máximo 16 caracteres').not().isEmpty().isString().isLength( { max: 16 } ),
    check('owner','El propietario de la tarjeta es obligatorio y debe tener como máximo 20 caracteres').not().isEmpty().isString().isLength( { max:20  } ),
    check('bank','El banco al que pertenece la tarjeta es obligatorio y debe tener como máximo 20 caracteres').not().isEmpty().isString().isLength( { max: 20 } ),
    check('due_date','La fecha de vencimiento de la tarjeta es obligatoria con formato YYYY-MM-DD').isDate(),
    validateFields,
    validateJWT
],createCard);

cardsRouter.put('/:id',[
    param('id', 'El id de la tarjeta es obligatorio y debe ser número entero').isInt(),
    check('card_number','El número de tarjeta es obligatorio y debe tener como máximo 16 caracteres').not().isEmpty().isString().isLength( { max: 16 } ),
    check('owner','El propietario de la tarjeta es obligatorio y debe tener como máximo 20 caracteres').not().isEmpty().isString().isLength( { max:20  } ),
    check('bank','El banco al que pertenece la tarjeta es obligatorio y debe tener como máximo 20 caracteres').not().isEmpty().isString().isLength( { max: 20 } ),
    check('due_date','La fecha de vencimiento de la tarjeta es obligatoria').isDate(),
    validateFields,
    validateJWT
], updateCard);

cardsRouter.delete('/:id',[
    param('id', 'El id de la tarjeta es obligatorio y debe ser número entero').isInt(),
    validateJWT
], deleteCard);


module.exports= cardsRouter;