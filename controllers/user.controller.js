/* eslint-disable consistent-return */
/* eslint-disable no-console */
const bcrypt = require('bcrypt');
const pool = require('../db');
const isEmpty = require('../utils/isEmpty');
const hashPassword = require('../utils/hashPassword');
const isValidEmail = require('../utils/isValidEmail');
const tokenize = require('../utils/token');

const signUp = async (req, res, next) => {
  const {
    email, first_name, last_name, password,
  } = req.body;
  const userTable = 'CREATE TABLE IF NOT EXISTS users(id UUID UNIQUE DEFAULT uuid_generate_v4(), email VARCHAR UNIQUE NOT NULL, first_name TEXT NOT NULL, last_name TEXT NOT NULL, password VARCHAR NOT NULL, is_admin BOOLEAN DEFAULT false, PRIMARY KEY (id))';

  if (isEmpty(email) || isEmpty(first_name) || isEmpty(last_name) || isEmpty(password)) {
    req.status = 400;
    return next(new Error('All fields are required for sign up'));
  }

  const hashedPassword = await hashPassword(password);

  const regQuery = {
    text:
      'INSERT INTO users(email, first_name, last_name, password) VALUES($1, $2, $3, $4) RETURNING id, email, is_admin',
    values: [email, first_name, last_name, hashedPassword],
  };

  const client = await pool.connect();

  try {
    if (!isValidEmail(email)) {
      throw new Error('Provide a valid email address');
    }

    await client.query(userTable);

    const users = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (!isEmpty(users.rows)) {
      req.status = 400;
      return next(new Error('User already exist, try another email'));
    }

    const { rows } = await client.query(regQuery);

    const { id, is_admin } = rows[0];
    const token = tokenize({ id, email, is_admin });

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
    req.status = 400;
    return next(new Error('Both email and password fields are required'));
  }

  const client = await pool.connect();

  try {
    if (!isValidEmail(email)) {
      throw new Error('Provide a valid email address');
    }

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

    const token = tokenize({ id: rows[0].id, email: rows[0].email, is_admin: rows[0].is_admin });

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
