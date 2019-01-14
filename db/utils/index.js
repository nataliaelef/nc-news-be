exports.formatArticles = articleData => {
  return articleData.map(({ created_by, created_at, ...restOfArticle }) => {
    return {
      username: created_by,
      created_at: new Date(created_at),
      ...restOfArticle
    };
  });
};

exports.formatComments = (commentData, articleRaws) => {
  return commentData.map(
    ({ created_by, created_at, belongs_to, ...restOfComments }) => {
      const art = articleRaws.find(article => {
        return article.title === belongs_to;
      });
      return {
        username: created_by,
        created_at: new Date(created_at),
        article_id: art.article_id,
        ...restOfComments
      };
    }
  );
};
