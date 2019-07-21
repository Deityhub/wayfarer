import { Pool } from 'pg';
import config from 'config';

export default new Pool({
  user: config.get('db.user'),
  password: config.get('db.password'),
  host: config.get('db.host'),
  port: config.get('db.port'),
  database: config.get('db.database'),
});
