const topicsRouter = require('express').Router();
const {
  getTopics,
  addTopic,
  getArticlesByTopic,
  addArticleByTopic
} = require('../controllers/topicsController');

const { handle405 } = require('../errors');

topicsRouter.get('/', getTopics);
topicsRouter.post('/', addTopic);
topicsRouter.get('/:topic/articles', getArticlesByTopic);
topicsRouter.post('/:topic/articles', addArticleByTopic);
topicsRouter.all('/', handle405);

module.exports = topicsRouter;
