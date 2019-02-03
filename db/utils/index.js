exports.formatArticles = data => data.map(({ created_by, created_at, ...restOfArticle }) => ({
  username: created_by,
  created_at: new Date(created_at),
  ...restOfArticle,
}));

exports.formatComments = (commentData, articleRaws) => commentData.map(
  ({
    created_by, created_at, belongs_to, ...restOfComments
  }) => {
    const art = articleRaws.find(article => article.title === belongs_to);
    return {
      username: created_by,
      created_at: new Date(created_at),
      article_id: art.article_id,
      ...restOfComments,
    };
  },
);
