/* eslint-disable camelcase */
/* eslint-disable no-console */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const isEmpty = require('../utils/isEmpty');

// eslint-disable-next-line consistent-return
const signUp = async (req, res, next) => {
  const {
    email, first_name, last_name, password,
  } = req.body;
  const userTable = 'CREATE TABLE IF NOT EXISTS users(id SERIAL PRIMARY KEY, email VARCHAR UNIQUE NOT NULL, first_name VARCHAR(40) NOT NULL, last_name VARCHAR(40) NOT NULL, password VARCHAR NOT NULL, is_admin BOOLEAN DEFAULT false)';

  if (isEmpty(email) || isEmpty(first_name) || isEmpty(last_name) || isEmpty(password)) {
    req.status = 400;
    next(new Error('All fiels are required for sign up'));
  }

  const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUND));
  const hashedPassword = await bcrypt.hash(password, salt);

  const regQuery = {
    text:
      'INSERT INTO users(email, first_name, last_name, password) VALUES($1, $2, $3, $4) RETURNING id, email, is_admin',
    values: [email, first_name, last_name, hashedPassword],
  };

  const client = await pool.connect();

  try {
    await client.query(userTable);

    const users = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (users.rows.length > 0) {
      req.status = 400;
      return next(new Error('User already exist, try another email'));
    }

    const { rows } = await client.query(regQuery);

    if (!rows.length > 0) {
      next(new Error('User not created, please try again'));
    }

    const { id, is_admin } = rows[0];
    const token = jwt.sign({ user_id: id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).send({ status: 'success', data: { user_id: id, is_admin, token } });
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};

module.exports = { signUp };
