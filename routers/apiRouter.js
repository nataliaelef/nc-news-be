const apiRouter = require('express').Router();
const topicsRouter = require('./topicsRouter');
const articlesRouter = require('./articlesRouter');
const usersRouter = require('./usersRouter');
const { getEndpoints } = require('../controllers/apiController');

apiRouter.use('/topics', topicsRouter);
apiRouter.use('/articles', articlesRouter);
apiRouter.use('/users', usersRouter);

apiRouter.get('/', getEndpoints);

module.exports = apiRouter;
