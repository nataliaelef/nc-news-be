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
  const columns = [
    'author',
    'title',
    'article_id',
    'votes',
    'comment_count',
    'created_at',
    'topic'
  ];
  const {
    limit: maxResults,
    sort_by,
    p: page,
    order,
    ...restOfTopicArt
  } = req.query;
  if (
    (sort_by && !columns.includes(sort_by)) ||
    (maxResults && isNaN(maxResults)) ||
    (page && isNaN(page))
  ) {
    return res.status(400).send({ message: 'bad request' });
  }

  connection('articles')
    .select(
      'articles.username AS author',
      'articles.title',
      'articles.article_id',
      'articles.votes',
      'articles.created_at',
      'articles.topic'
    )
    .where(req.params)
    .offset((page - 1) * (maxResults || 10) || 0)
    .limit(maxResults || 10)
    .orderBy(sort_by || 'created_at', order || 'desc')
    .count('comments.article_id as comment_count')
    .leftJoin('topics', 'topics.slug', 'articles.topic')
    .leftJoin('comments', 'comments.article_id', 'articles.article_id')
    .groupBy('articles.article_id')
    .then(articles => {
      if (!articles.length)
        return Promise.reject({ status: 404, message: 'No articles found' });
      res.status(200).send({ articles });
    })
    .catch(next);
};

exports.addArticleByTopic = (req, res, next) => {
  const { topic } = req.params;
  const { title, username, body } = req.body;
  connection('articles')
    .insert({ topic, title, username, body })
    .returning('*')
    .then(([article]) => {
      //console.log(article);

      res.status(201).send({ article });
    })
    .catch(next);
};
