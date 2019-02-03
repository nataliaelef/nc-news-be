exports.up = function (knex, Promise) {
  return knex.schema.createTable('comments', (table) => {
    table.increments('comment_id').primary();
    table.string('username').references('users.username');
    table
      .integer('article_id')
      .references('articles.article_id')
      .onDelete('CASCADE');
    table
      .integer('votes')
      .notNullable()
      .defaultTo(0);
    table
      .date('created_at', 6)
      .notNullable()
      .defaultTo(knex.fn.now(6));
    table.string('body', 2000).notNullable();
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('comments');
};
