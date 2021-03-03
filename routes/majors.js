const { Router } = require('express');
const {getAllMajors,deleteMajor,updateMajor,createMajor} = require('../controllers/majorController');

const majorsRouter = Router();

majorsRouter.get('/', getAllMajors);
majorsRouter.post( '/', createMajor);
majorsRouter.put( '/:id', updateMajor);
majorsRouter.delete( '/:id', deleteMajor);

module.exports = majorsRouter;