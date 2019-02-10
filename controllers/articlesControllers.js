const connection = require('../db/connection');

exports.getArticles = (req, res, next) => {
  const {
    limit: maxResults, sort_by, order, p: page,
  } = req.query;

  const columns = [
    'author',
    'title',
    'article_id',
    'votes',
    'body',
    'created_at',
    'topic',
  ];

  if (sort_by && !columns.includes(sort_by)) {
    return res.status(400).send({ message: 'bad request' });
  }

  connection
    .select(
      'articles.username AS author',
      'title',
      'articles.body',
      'articles.article_id',
      'articles.votes',
      'articles.created_at',
      'topic',
    )
    .from('articles')
    .leftJoin('comments', 'comments.article_id', 'articles.article_id')
    .count('comments.comment_id as total_count')
    .groupBy('articles.article_id')
    .limit(maxResults || 10)
    .orderBy(sort_by || 'created_at', order || 'desc')
    .offset((page - 1) * (maxResults || 10) || 0)
    .then((articles) => {
      if (!articles.length) return Promise.reject({ status: 404, message: 'No articles found' });
      return res.status(200).send({ articles });
    })
    .catch(next);
  return null;
};

exports.getArticleById = (req, res, next) => {
  const { sort_by } = req.query;
  const columns = [
    'author',
    'title',
    'article_id',
    'votes',
    'body',
    'created_at',
    'topic',
  ];

  const { article_id } = req.params;
  if (
    (sort_by && !columns.includes(sort_by))
    || (req.params.article_id && !parseInt(article_id, 10))
  ) return res.status(400).send({ message: 'bad request' });

  connection
    .select(
      'articles.username AS author',
      'title',
      'articles.article_id',
      'articles.votes',
      'articles.body',
      'articles.created_at',
      'topic',
    )
    .from('articles')
    .leftJoin('comments', 'comments.article_id', 'articles.article_id')
    .count('comments.comment_id as total_count')
    .groupBy('articles.article_id')
    .where('articles.article_id', article_id)
    .then(([article]) => {
      if (!article) return Promise.reject({ status: 404, message: 'Not found' });
      return res.status(200).send({ article });
    })
    .catch(next);
  return null;
};

// Expexts article_id as path parm
// Expects body with following properties
// inc_votes
exports.updateArticle = (req, res, next) => {
  const { inc_votes } = req.body;

  const query = connection('articles')
    .select()
    .where('article_id', req.params.article_id)
    .returning('*');

  if (req.body !== undefined && Object.keys(req.body).length) {
    query.update(req.body);
  }

  // When increment and update are used in the same query then
  // Knex ignores update and uses only increment
  if (inc_votes !== undefined) {
    query.increment('votes', inc_votes || 0);
  }

  query
    .then(([article]) => {
      if (!article) return Promise.reject({ status: 404, message: 'Not found' });
      return res.status(200).send({ article });
    })
    .catch(next);
  return null;
};

exports.deleteArticleById = (req, res, next) => {
  const { article_id } = req.params;

  if (article_id && !parseInt(article_id, 10)) res.status(400).send({ message: 'bad request' });

  connection('articles')
    .select()
    .where(req.params, true)
    .del()
    .returning('*')
    .then(([article]) => {
      if (!article) return Promise.reject({ status: 404, message: 'Not found' });
      return res.status(204).send({ article });
    })
    .catch(next);
  return null;
};

exports.getCommentsByArticleId = (req, res, next) => {
  const columns = [
    'article_id',
    'votes',
    'created_at',
    'author',
    'body',
    'comment_id',
  ];

  const { article_id } = req.params;
  const {
    limit: maxResults, sort_by, order, p: page,
  } = req.query;

  if (
    (maxResults && !parseInt(maxResults, 10))
    || (sort_by && !columns.includes(sort_by))
    || ((page && !parseInt(page, 10))
      || (req.params.article_id && !parseInt(article_id, 10)))
  ) return res.status(400).send({ message: 'bad request' });

  const query = connection('comments')
    .select(
      'comments.comment_id',
      'comments.article_id',
      'comments.votes',
      'comments.created_at',
      'comments.username as author',
      'comments.body',
    )
    .where(req.params)
    .limit(maxResults || 10)
    .orderBy(sort_by || 'created_at', order === 'true' ? 'asc' : 'desc')
    .offset((page - 1) * (maxResults || 10) || 0);
  query
    .then(comments => res.status(200).send({ comments }))
    .catch(next);
  return null;
};

exports.addCommentByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;

  if ((article_id && !parseInt(article_id, 10)) || !username || !body) res.status(400).send({ message: 'bad request' });

  connection('comments')
    .insert({ article_id, username, body })
    .returning('*')
    .then(([comment]) => {
      if (!comment) return Promise.reject({ status: 404, message: 'Not found' });
      return res.status(201).send({ comment });
    })
    .catch(next);
  return null;
};

exports.updateCommentByCommentId = (req, res, next) => {
  const { inc_votes } = req.body;
  const { comment_id, article_id } = req.params;

  if (
    (comment_id && !parseInt(comment_id, 10))
    || (article_id && !parseInt(article_id, 10))
    || (!parseInt(inc_votes, 10) && inc_votes !== '')
  ) res.status(400).send({ message: 'bad request' });

  const query = connection('comments')
    .select()
    .where(req.params)
    .returning('*');

  if (req.body !== undefined && Object.keys(req.body).length) {
    query.update(req.body);
  }

  if (inc_votes !== undefined) {
    query.increment('votes', inc_votes || 0);
  }

  query
    .then(([comment]) => {
      if (!comment) return Promise.reject({ status: 404, message: 'Not found' });
      return res.status(200).send({ comment });
    })
    .catch(next);
  return null;
};

exports.deleteCommentById = (req, res, next) => {
  const { article_id, comment_id } = req.params;

  if (
    (article_id && !parseInt(article_id, 10))
    || (comment_id && !parseInt(comment_id, 10))
  ) res.status(400).send({ message: 'bad request' });

  connection('comments')
    .select('*')
    .where(req.params)
    .del()
    .returning('*')
    .then(([comment]) => {
      // console.log(comment);
      if (!comment) return Promise.reject({ status: 404, message: 'Not found' });
      return res.status(204).send({});
    })
    .catch(next);
  return null;
};
