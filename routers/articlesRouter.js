const articlesRouter = require('express').Router();
const { getArticles } = require('../controllers/articlesControllers');

articlesRouter.get('/', getArticles);

module.exports = articlesRouter;
