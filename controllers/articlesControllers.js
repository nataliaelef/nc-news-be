const connection = require('../db/connection');

exports.getArticles = (req, res, next) => {
  //console.log(req.params);

  connection
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
    .leftJoin('comments', 'comments.article_id', '=', 'articles.article_id')
    .count('comments.comment_id as comment_count')
    .groupBy('articles.article_id')
    .then(articles => {
      //console.log(articles);
      res.status(200).send({ articles });
    })
    .catch(next);
};
