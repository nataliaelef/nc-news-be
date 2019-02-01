const connection = require('../db/connection');

exports.getArticles = (req, res, next) => {
  // console.log(req.params);
  const {
    limit: maxResults,
    sort_by,
    order,
    p: page,
    ...restOfArticles
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
      'articles.article_id',
      'articles.votes',
      'articles.created_at',
      'topic',
    )
    .from('articles')
    .leftJoin('comments', 'comments.article_id', 'articles.article_id')
    .count('comments.comment_id as comment_count')
    .groupBy('articles.article_id')
    .limit(maxResults || 10)
    .orderBy(sort_by || 'created_at', order || 'desc')
    .offset((page - 1) * (maxResults || 10) || 0)
    .then((articles) => {
      // console.log(articles);
      if (!articles.length) return Promise.reject({ status: 404, message: 'No articles found' });
      res.status(200).send({ articles });
    })
    .catch(next);
};

exports.getArticleById = (req, res, next) => {
  const {
    limit: maxResults,
    sort_by,
    order,
    p: page,
    ...restOfArticles
  } = req.query;

  const { article_id } = req.params;
  if (
    (sort_by && !columns.includes(sort_by))
    || (req.params.article_id && isNaN(article_id))
  ) return res.status(400).send({ message: 'bad request' });

  connection
    .select(
      'articles.username AS author',
      'title',
      'articles.article_id',
      'articles.votes',
      'articles.created_at',
      'topic',
    )
    .from('articles')
    .leftJoin('comments', 'comments.article_id', 'articles.article_id')
    .count('comments.comment_id as comment_count')
    .groupBy('articles.article_id')
    .where('articles.article_id', article_id)
    .then((article) => {
      // console.log(articles);
      if (!article.length) return Promise.reject({ status: 404, message: 'Not found' });
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.updateArticle = (req, res, next) => {
  const { inc_votes } = req.body;

  const query = connection('articles')
    .select()
    .update(req.body)
    .where('article_id', req.params.article_id)
    .returning('*');

  // When increment and update are used in the same query then
  // Knex ignores update and uses only increment
  if (inc_votes != undefined) {
    query.increment('votes', inc_votes || 0);
  }

  query
    .then(([article]) => {
      if (!article) return Promise.reject({ status: 404, message: 'Not found' });
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.deleteArticleById = (req, res, next) => {
  const { article_id } = req.params;

  if (article_id && isNaN(article_id)) res.status(400).send({ message: 'bad request' });
  // if(article_id && !isNaN(article_id) )

  connection('articles')
    .select()
    .where(req.params, true)
    .del()
    .returning('*')
    .then((article) => {
      if (!article.length) return Promise.reject({ status: 404, message: 'Not found' });
      res.status(204).send(article);
    })
    .catch(next);
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
    limit: maxResults,
    sort_by,
    order,
    p: page,
    ...restOfComments
  } = req.query;

  if (
    (maxResults && isNaN(maxResults))
    || (sort_by && !columns.includes(sort_by))
    || ((page && isNaN(page)) || (req.params.article_id && isNaN(article_id)))
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
    .then((comments) => {
      if (!comments.length) return Promise.reject({ status: 404, message: 'Not found' });
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.addCommentByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;

  if (article_id && isNaN(article_id)) res.status(400).send({ message: 'bad request' });

  connection('comments')
    .insert({ article_id, username, body })
    .returning('*')
    .then(([comment]) => {
      if (!comment) return Promise.reject({ status: 404, message: 'Not found' });
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.updateCommentByCommentId = (req, res, next) => {
  const { inc_votes } = req.body;
  const { comment_id, article_id } = req.params;

  if ((comment_id && isNaN(comment_id)) || (article_id && isNaN(article_id))) res.status(400).send({ message: 'bad request' });

  const query = connection('comments')
    .select()
    .update(req.body)
    .where(req.params)
    .returning('*');

  if (inc_votes != undefined) {
    query.increment('votes', inc_votes || 0);
  }

  query
    .then(([comment]) => {
      if (!comment) return Promise.reject({ status: 404, message: 'Not found' });
      res.status(200).send({ comment });
    })
    .catch(next);
};

exports.deleteCommentById = (req, res, next) => {
  const { article_id, comment_id } = req.params;

  if ((article_id && isNaN(article_id)) || (comment_id && isNaN(comment_id))) res.status(400).send({ message: 'bad request' });

  connection('comments')
    .select()
    .where(req.params)
    .del()
    .then((comment) => {
      if (!comment.length) return Promise.reject({ status: 404, message: 'Not found' });
      res.status(204).send();
    })
    .catch(next);
};
