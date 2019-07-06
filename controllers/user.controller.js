/* eslint-disable consistent-return */
/* eslint-disable camelcase */
/* eslint-disable no-console */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');
const pool = require('../db');
const isEmpty = require('../utils/isEmpty');

const signUp = async (req, res, next) => {
  const {
    email,
    first_name,
    last_name,
    password,
  } = req.body;
  const userTable = 'CREATE TABLE IF NOT EXISTS users(id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), email VARCHAR UNIQUE NOT NULL, first_name VARCHAR(40) NOT NULL, last_name VARCHAR(40) NOT NULL, password VARCHAR NOT NULL, is_admin BOOLEAN DEFAULT false)';

  if (isEmpty(email) || isEmpty(first_name) || isEmpty(last_name) || isEmpty(password)) {
    req.status = 400;
    next(new Error('All fields are required for sign up'));
  }

  const salt = await bcrypt.genSalt(Number(config.get('saltRound')));
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
    if (!isEmpty(users.rows)) {
      req.status = 400;
      return next(new Error('User already exist, try another email'));
    }

    const { rows } = await client.query(regQuery);

    if (isEmpty(rows)) {
      next(new Error('User not created, please try again'));
    }

    const { id, is_admin } = rows[0];
    const token = jwt.sign({ email, is_admin }, config.get('jwtKey'), { expiresIn: '1h' });

    res.status(201).send({ status: 'success', data: { user_id: id, is_admin, token } });
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};

const signIn = async (req, res, next) => {
  const { email, password } = req.body;
  const userQuery = {
    text: 'SELECT * FROM users WHERE email = $1',
    values: [email],
  };

  if (isEmpty(email) || isEmpty(password)) {
    req.status = 401;
    return next(new Error('Both email and password fields are required'));
  }

  const client = await pool.connect();

  try {
    const { rows } = await client.query(userQuery);
    if (isEmpty(rows)) {
      req.status = 401;
      return next(new Error('Invalid log in details'));
    }

    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) {
      req.status = 401;
      return next(new Error('Invalid log in details'));
    }

    const token = jwt.sign(
      { email: rows[0].email, is_admin: rows[0].is_admin },
      config.get('jwtKey'),
      { expiresIn: '1h' },
    );

    res.status(200).send({
      status: 'success',
      data: { user_id: rows[0].id, is_admin: rows[0].is_admin, token },
    });
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};

module.exports = { signUp, signIn };
