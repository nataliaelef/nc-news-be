const connection = require('../db/connection');

exports.getArticles = (req, res, next) => {
  //console.log(req.params);
  const {
    limit: maxResults,
    sort_by,
    order,
    p: page,
    ...restOfArticles
  } = req.query;

  const { article_id } = req.params;
  const columns = [
    'author',
    'title',
    'article_id',
    'votes',
    'body',
    'created_at',
    'topic'
  ];

  if (
    (sort_by && !columns.includes(sort_by)) ||
    (req.params.article_id && isNaN(article_id))
  ) {
    return res.status(400).send({ message: 'bad request' });
  }
  const query = connection
    .select(
      'articles.username AS author',
      'title',
      'articles.article_id',
      'articles.votes',
      'articles.body',
      'articles.created_at',
      'topic'
    )
    .from('articles')
    .leftJoin('comments', 'comments.article_id', 'articles.article_id')
    .count('comments.comment_id as comment_count')
    .groupBy('articles.article_id');

  if (article_id) query.where('articles.article_id', article_id);
  else
    query
      .limit(maxResults || 10)
      .orderBy(sort_by || 'created_at', order || 'desc')
      .offset((page - 1) * (maxResults || 10) || 0);

  query
    .then(articles => {
      //console.log(articles);
      if (!articles.length)
        return Promise.reject({ status: 404, message: 'No articles found' });
      res.status(200).send({ articles });
    })
    .catch(next);
};

exports.updateArticle = (req, res, next) => {
  connection('articles')
    .select()
    .update(req.body)
    .returning('*')
    .then(article => {
      res.status(200).send({ article });
    })
    .catch(console.log);
};

exports.deleteArticleById = (req, res, next) => {
  connection('articles')
    .select()
    .where(req.params, true)
    .del()
    .then(() => res.status(204).send())
    .catch(next);
};

exports.getCommentsByArticleId = (req, res, next) => {
  const columns = ['article_id', 'votes', 'created_at', 'author', 'body'];

  const {
    limit: maxResults,
    sort_by,
    order,
    p: page,
    ...restOfComments
  } = req.query;

  if (
    (maxResults && isNaN(maxResults)) ||
    (sort_by && !columns.includes(sort_by)) ||
    (page && isNaN(page))
  )
    return res.status(400).send({ message: 'bad request' });

  connection('comments')
    .select(
      'comments.article_id',
      'comments.votes',
      'comments.created_at',
      'comments.username as author',
      'comments.body'
    )
    .where(req.params)
    .limit(maxResults || 10)
    .orderBy(sort_by || 'created_at', order || 'desc')
    .offset((page - 1) * (maxResults || 10) || 0)
    .then(comments => {
      if (!comments.length)
        return Promise.reject({ status: 404, message: 'No articles found' });
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.addCommentByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;
  connection('comments')
    .insert({ article_id, username, body })
    .returning('*')
    .then(([comment]) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};
