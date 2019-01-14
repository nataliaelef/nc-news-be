exports.up = function(knex, Promise) {
  return knex.schema.createTable('articles', table => {
    table
      .increments('article_id')
      .primary()
      .unique();
    table.string('title');
    table.string('body');
    table.integer('votes').defaultTo(0);
    table.string('topic').references('topics.slug');
    table
      .string('username')
      .references('users.username')
      .notNullable();
    table.timestamps();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('articles');
};
