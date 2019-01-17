const usersRouter = require('express').Router();
const { getUsers } = require('../controllers/usersControllers');
const { handle405 } = require('../errors');

usersRouter.get('/', getUsers);
usersRouter.get('/:username', getUsers);
usersRouter.all('/', handle405);

module.exports = usersRouter;
