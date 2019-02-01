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

// articlesRouter.patch('/:article_id/comments/:comment_id', updatedComment);
// articlesRouter.delete('/:article_id/comments/:comment_id', deleteCommentById);
// articlesRouter.get('/:article_id/comments', getCommentsByArticleId);
// articlesRouter.post('/:article_id/comments', addCommentByArticleId);
// articlesRouter.get('/:article_id', getArticles);
// articlesRouter.patch('/:article_id', updateArticle);
// articlesRouter.delete('/:article_id', deleteArticleById);
// articlesRouter.get('/', getArticles);
// articlesRouter.all('/', handle405);

module.exports = articlesRouter;
