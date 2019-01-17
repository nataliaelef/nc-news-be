const articlesRouter = require('express').Router();
const {
  getArticles,
  updateArticle,
  deleteArticleById,
  getCommentsByArticleId,
  addCommentByArticleId,
  updatedComment,
  deleteCommentById
} = require('../controllers/articlesControllers');

const { handle405 } = require('../errors');

articlesRouter.get('/', getArticles);
articlesRouter.get('/:article_id', getArticles);
articlesRouter.patch('/:article_id', updateArticle);
articlesRouter.delete('/:article_id', deleteArticleById);
articlesRouter.get('/:article_id/comments', getCommentsByArticleId);
articlesRouter.post('/:article_id/comments', addCommentByArticleId);
articlesRouter.patch('/:article_id/comments/:comment_id', updatedComment);
articlesRouter.delete('/:article_id/comments/:comment_id', deleteCommentById);
articlesRouter.all('/', handle405);

module.exports = articlesRouter;
