exports.up = function(knex, Promise) {
  return knex.schema.createTable('articles', table => {
    table
      .increments('article_id')
      .primary()
      .unique();
    table.string('title');
    table.string('body', 2000);
    table.integer('votes').defaultTo(0);
    table.string('topic').references('topics.slug');
    table
      .string('username')
      .references('users.username')
      .notNullable();
    table.date('created_at', 6).defaultTo(knex.fn.now(6));
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('articles');
};
