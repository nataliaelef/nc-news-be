const topicsRouter = require('express').Router();
const {
  getTopics,
  addTopic,
  getArticlesByTopic
} = require('../controllers/topicsController');

topicsRouter.get('/', getTopics);
topicsRouter.post('/', addTopic);
topicsRouter.get('/:topic/articles', getArticlesByTopic);

module.exports = topicsRouter;
