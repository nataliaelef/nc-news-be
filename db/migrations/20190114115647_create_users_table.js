exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', table => {
    table
      .string('username')
      .primary()
      .unique()
      .notNullable();
    table.string('name').notNullable();
    table
      .string('avatar_url')
      .notNull()
      .defaultTo(
        `https://api.adorable.io/avatars/${Math.round(Math.random() * 1000)}`
      );
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};
