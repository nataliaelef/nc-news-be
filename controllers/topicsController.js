const connection = require('../db/connection');

exports.getTopics = (req, res, next) => {
  connection('topics')
    .select('*')
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch(next);
};

exports.addTopic = (req, res, next) => {
  const { slug, description } = req.body;

  if (!slug || !description) res.status(400).send({ message: 'bad request' });

  connection('topics')
    .insert(req.body)
    .returning('*')
    .then(([topic]) => res.status(201).send({ topic }))
    .catch(next);
  return null;
};

exports.getArticlesByTopic = (req, res, next) => {
  const sortColumns = [
    'author',
    'title',
    'article_id',
    'votes',
    'total_count',
    'created_at',
    'topic',
    'body',
  ];
  const {
    limit: maxResults, sort_by, p: page, order,
  } = req.query;
  if (
    (sort_by && !sortColumns.includes(sort_by))
    || (maxResults && !parseInt(maxResults, 10))
    || (page && !parseInt(page, 10))
  ) {
    return res.status(400).send({ message: 'bad request' });
  }

  const query = connection('articles')
    .select(
      'articles.username AS author',
      'articles.title',
      'articles.article_id',
      'articles.votes',
      'articles.created_at',
      'articles.topic',
      'articles.body',
    )
    .where(req.params)
    .offset((page - 1) * (maxResults || 10) || 0)
    .limit(maxResults || 10)
    .orderBy(sort_by ? `articles.${sort_by}` : 'articles.created_at', order || 'desc')
    .count('comments.article_id as total_count')
    .leftJoin('topics', 'topics.slug', 'articles.topic')
    .leftJoin('comments', 'comments.article_id', 'articles.article_id')
    .groupBy('articles.article_id');

  query
    .then((articles) => {
      if (!articles.length) return Promise.reject({ status: 404, message: 'No articles found' });
      return res.status(200).send({ articles });
    })
    .catch(next);
  return null;
};

exports.addArticleByTopic = (req, res, next) => {
  const { topic } = req.params;
  const { title, username, body } = req.body;
  connection('articles')
    .insert({
      topic,
      title,
      username,
      body,
    })
    .returning('*')
    .then(([article]) => {
      res.status(201).send({ article });
    })
    .catch(next);
};

exports.deleteTopicBySlug = (req, res, next) => {
  const { topic: slug } = req.params;
  connection('topics')
    .select()
    .where({ slug }, true)
    .del()
    .returning('*')
    .then(([topic]) => {
      if (!topic) {
        return Promise.reject({ status: 404, message: 'Not found' });
      }
      return res.status(204).send({ topic });
    })
    .catch(next);

  return null;
};
