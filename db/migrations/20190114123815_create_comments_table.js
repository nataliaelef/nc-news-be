exports.up = function(knex, Promise) {
  return knex.schema.createTable('comments', table => {
    table.increments('comment_id').primary();
    table.string('username').references('users.username');
    table.integer('article_id').references('articles.article_id');
    table.integer('votes').defaultTo(0);
    table.timestamps();
    table.string('body');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('comments');
};
