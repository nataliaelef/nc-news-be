const {} = require('../data');

exports.seed = function(knex, Promise) {
  return knex('topics')
    .insert('topicData')
    .returning('*')
    .then(topicRaws => {
      return knex('users')
        .insert('userData')
        .returning('*')
        .then(userRaws => {
          return knex('articles')
            .insert('articleData')
            .returning('*')
            .then(articlesData => {
              return knex('comments')
                .insert('commentData')
                .returning('*');
            });
        });
    });
};
