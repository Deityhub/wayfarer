const { Pool } = require('pg');
const config = require('config');

module.exports = new Pool({
  user: config.get('db.user'),
  password: config.get('db.password'),
  host: config.get('db.host'),
  port: config.get('db.port'),
  database: config.get('db.database'),
});
