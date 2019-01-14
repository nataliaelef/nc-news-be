exports.up = function(knex, Promise) {
  return knex.schema.createTable('topics', table => {
    table.string('description');
    table.string('slug').unique();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('topics');
};
