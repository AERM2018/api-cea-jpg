const { Router } = require('express');
const {getAllGroups,createGroup,updateGroup,deleteGroup} = require('../controllers/groupsController');

const groupsRouter = Router();

groupsRouter.get('/', getAllGroups);
groupsRouter.post( '/', createGroup);
groupsRouter.put( '/:id', updateGroup);
groupsRouter.delete( '/:id', deleteGroup);

module.exports = groupsRouter;