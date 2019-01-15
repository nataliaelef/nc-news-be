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
  const { limit, sort_by, p, order, ...restOfTopicArt } = req.params;
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
    .count('articles.article_id as comment_count')
    .join('articles', 'topics.slug', 'articles.topic')
    .groupBy('articles.article_id')
    .then(articles => {
      res.status(200).send({ articles });
    });
};
