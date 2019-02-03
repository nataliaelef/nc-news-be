const apiRouter = require('express').Router();
const topicsRouter = require('./topicsRouter');
const articlesRouter = require('./articlesRouter');
const usersRouter = require('./usersRouter');
const { getEndpoints } = require('../controllers/apiController');
const { handle405 } = require('../errors');

apiRouter
  .route('/')
  .get(getEndpoints)
  .all(handle405);

apiRouter.use('/topics', topicsRouter);
apiRouter.use('/articles', articlesRouter);
apiRouter.use('/users', usersRouter);

module.exports = apiRouter;
