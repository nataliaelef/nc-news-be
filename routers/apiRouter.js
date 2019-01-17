const apiRouter = require('express').Router();
const topicsRouter = require('./topicsRouter');
const articlesRouter = require('./articlesRouter');
const usersRouter = require('./usersRouter');
const { getEndpoints } = require('../controllers/apiController');
const { handle405 } = require('../errors');

apiRouter.use('/topics', topicsRouter);
apiRouter.use('/articles', articlesRouter);
apiRouter.use('/users', usersRouter);

apiRouter.get('/', getEndpoints);
apiRouter.all('/', handle405);

module.exports = apiRouter;
