const usersRouter = require('express').Router();
const {
  getUsers,
  getUserByUsername,
} = require('../controllers/usersControllers');
const { handle405 } = require('../errors');

usersRouter
  .route('/')
  .get(getUsers)
  .all(handle405);

usersRouter
  .route('/:username')
  .get(getUserByUsername)
  .all(handle405);

// usersRouter.get('/', getUsers);
// usersRouter.all('/', handle405);
// usersRouter.get('/:username', getUsers);

module.exports = usersRouter;
