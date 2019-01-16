const topicsRouter = require('express').Router();
const {
  getTopics,
  addTopic,
  getArticlesByTopic,
  addArticleByTopic
} = require('../controllers/topicsController');

topicsRouter.get('/', getTopics);
topicsRouter.post('/', addTopic);
topicsRouter.get('/:topic/articles', getArticlesByTopic);
topicsRouter.post('/:topic/articles', addArticleByTopic);
module.exports = topicsRouter;
