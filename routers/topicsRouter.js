const topicsRouter = require('express').Router();
const {
  getTopics,
  addTopic,
  getArticlesByTopic,
  addArticleByTopic,
} = require('../controllers/topicsController');
const { handle405 } = require('../errors');

topicsRouter
  .route('/')
  .get(getTopics)
  .post(addTopic)
  .all(handle405);

topicsRouter
  .route('/:topic/articles')
  .get(getArticlesByTopic)
  .post(addArticleByTopic)
  .all(handle405);

module.exports = topicsRouter;
