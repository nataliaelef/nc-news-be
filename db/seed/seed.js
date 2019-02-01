const {
  topicData, userData, articleData, commentData,
} = require('../data/');
const { formatArticles, formatComments } = require('../utils/index');

exports.seed = function (knex, Promise) {
  return knex('topics')
    .insert(topicData)
    .returning('*')
    .then(topicRaws => knex('users')
      .insert(userData)
      .returning('*'))
    .then(userRaws => knex('articles')
      .insert(formatArticles(articleData))
      .returning('*'))
    .then(articleRaws => knex('comments')
      .insert(formatComments(commentData, articleRaws))
      .returning('*'));
};
