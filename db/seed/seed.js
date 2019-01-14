const { topicData, userData, articleData, commentData } = require('../data/');
const { formatArticles, formatComments } = require('../utils/index');

exports.seed = function(knex, Promise) {
  return knex('topics')
    .insert(topicData)
    .returning('*')
    .then(topicRaws =>
      knex('users')
        .insert(userData)
        .returning('*')
    )
    .then(userRaws => {
      return knex('articles')
        .insert(formatArticles(articleData))
        .returning('*');
    })
    .then(articleRaws => {
      return knex('comments')
        .insert(formatComments(commentData, articleRaws))
        .returning('*');
    });
};
