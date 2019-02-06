const articlesRouter = require('express').Router();
const {
  getArticles,
  updateArticle,
  getArticleById,
  deleteArticleById,
  getCommentsByArticleId,
  addCommentByArticleId,
  updateCommentByCommentId,
  deleteCommentById,
} = require('../controllers/articlesControllers');
const { handle405 } = require('../errors');

articlesRouter
  .route('/')
  .get(getArticles)
  .all(handle405);

articlesRouter
  .route('/:article_id')
  .get(getArticleById)
  .patch(updateArticle)
  .delete(deleteArticleById)
  .all(handle405);

articlesRouter
  .route('/:article_id/comments')
  .get(getCommentsByArticleId)
  .post(addCommentByArticleId)
  .all(handle405);

articlesRouter
  .route('/:article_id/comments/:comment_id')
  .patch(updateCommentByCommentId)
  .delete(deleteCommentById)
  .all(handle405);

module.exports = articlesRouter;
