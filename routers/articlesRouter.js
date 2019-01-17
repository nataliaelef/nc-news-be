const articlesRouter = require('express').Router();
const {
  getArticles,
  updateArticle,
  deleteArticleById,
  getCommentsByArticleId,
  addCommentByArticleId
} = require('../controllers/articlesControllers');

articlesRouter.get('/', getArticles);
articlesRouter.get('/:article_id', getArticles);
articlesRouter.patch('/:article_id', updateArticle);
articlesRouter.delete('/:article_id', deleteArticleById);
articlesRouter.get('/:article_id/comments', getCommentsByArticleId);
articlesRouter.post('/:article_id/comments', addCommentByArticleId);

module.exports = articlesRouter;
