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

  //to avoid article_id to be translated as boolean
  const article_id = parseInt(req.params.article_id);
  const columns = [
    'author',
    'title',
    'article_id',
    'votes',
    'body',
    'created_at',
    'topic'
  ];

  if (sort_by && !columns.includes(sort_by)) {
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
      res.status(200).send({ articles });
    })
    .catch(next);
};
