exports.up = function (knex, Promise) {
  return knex.schema.createTable('users', (table) => {
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
        'https://www.qualiscare.com/wp-content/uploads/2017/08/default-user.png',
      );
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('users');
};
