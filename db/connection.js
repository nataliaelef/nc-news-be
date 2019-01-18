const ENV = process.env.NODE_ENV || 'development';

const config =
  ENV === 'production'
    ? { client: 'pg', connection: process.env.DATABASE_URL }
    : require('../knexfile')[ENV];

module.exports = require('knex')(config);
// const knex = require('knex');
// const dbConfig = require('../knexfile')[ENV];

// const connection = knex(dbConfig);

// module.exports = connection;
