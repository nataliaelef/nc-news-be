const connection = require('../db/connection');

exports.getTopics = (req, res, next) => {
  //console.log('getting topics....');
  //console.log(req.params);

  connection('topics')
    .select('*')
    .then(topics => {
      res.status(200).send({ topics });
    })
    .catch(next);
};

exports.addTopic = (req, res, next) => {
  //console.log(req);
  connection('topics')
    .insert(req.body)
    .returning('*')
    .then(([topic]) => res.status(201).send({ topic }))
    .catch(next);
};

exports.getArticlesByTopic = (req, res, next) => {
  //console.log(req.params);
  const col = [
    'author',
    'title',
    'article_id',
    'votes',
    'comment_count',
    'created_at',
    'topic'
  ];
  const { limit: maxResults, sort_by, p, order, ...restOfTopicArt } = req.query;

  if (sort_by && !col.includes(sort_by)) {
    return res.status(400).send({ message: 'bad request' });
  }

  connection('topics')
    .select(
      'username AS author',
      'title',
      'article_id',
      'votes',
      'article_id AS comment_count',
      'created_at',
      'topic'
    )
    .where(req.params)
    .offset((p - 1) * (maxResults || 10) || 0)
    .limit(maxResults || 10)
    .orderBy(sort_by || 'created_at', order || 'desc')
    .count('articles.article_id as comment_count')
    .join('articles', 'topics.slug', 'articles.topic')
    .groupBy('articles.article_id')
    .then(articles => {
      if (!articles.length)
        return Promise.reject({ status: 404, message: 'No articles found' });
      res.status(200).send({ articles });
    })
    .catch(next);
};
