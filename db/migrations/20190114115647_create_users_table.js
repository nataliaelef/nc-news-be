exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', table => {
    table
      .string('username')
      .primary()
      .unique()
      .notNullable();
    table.string('name');
    table.string('avatar_url');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};
