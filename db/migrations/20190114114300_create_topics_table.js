exports.up = function (knex, Promise) {
  return knex.schema.createTable('topics', (table) => {
    table
      .string('slug')
      .unique()
      .notNullable();
    table.string('description').notNullable();
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('topics');
};
