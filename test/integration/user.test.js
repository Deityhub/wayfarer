/* eslint-disable no-unused-expressions */
/* eslint-disable camelcase */
require('dotenv').config();
const bcrypt = require('bcrypt');
const config = require('config');
const chai = require('chai');
const chaiHttp = require('chai-http');

const pool = require('../../db');
const user = require('../../controllers/user.controller');

const { expect } = chai;
chai.use(chaiHttp);

let server;

describe('User Routes', () => {
  before('testing user routes', () => {
    // eslint-disable-next-line global-require
    server = require('../../index');
  });
  after('testing user routes', () => {
    server.close();
  });

  describe('POST /auth/signup', () => {
    let email = 'test@test.com';
    const first_name = 'Michael';
    const last_name = 'Okeke';
    const password = 'superpassword';
    let client;

    beforeEach(async () => {
      client = await pool.connect();
      await client.query(
        'CREATE TABLE IF NOT EXISTS users(id SERIAL PRIMARY KEY, email VARCHAR UNIQUE NOT NULL, first_name VARCHAR(40) NOT NULL, last_name VARCHAR(40) NOT NULL, password VARCHAR NOT NULL, is_admin BOOLEAN DEFAULT false)',
      );
    });

    afterEach(async () => {
      await client.query('DROP TABLE IF EXISTS users');
      client.release();
    });

    it('signup controller must be a function', () => {
      expect(user.signUp).to.be.a('function');
    });

    it('should return status code 201 and success status, on successful user signup', (done) => {
      chai
        .request(server)
        .post('/api/v1/auth/signup')
        .send({
          email,
          first_name,
          last_name,
          password,
        })
        .end((err, res) => {
          if (err) return;

          expect(res).to.have.status(201);
          expect(res.body.status).to.eql('success');
          done();
        });
    });

    it('should return user id after creating user', (done) => {
      chai
        .request(server)
        .post('/api/v1/auth/signup')
        .send({
          email,
          first_name,
          last_name,
          password,
        })
        .end((err, res) => {
          if (err) return;

          expect(res.body.data.user_id).to.be.greaterThan(0);
          expect(res.body.data.user_id).to.be.a('number');
          done();
        });
    });

    it('should tell whether the user is an admin or not', (done) => {
      chai
        .request(server)
        .post('/api/v1/auth/signup')
        .send({
          email,
          first_name,
          last_name,
          password,
        })
        .end((err, res) => {
          if (err) return;

          expect(res.body.data.is_admin).to.be.a('boolean');
          done();
        });
    });

    it('should return error and status code 400, if any of the signup fields is empty', (done) => {
      email = null;

      chai
        .request(server)
        .post('/api/v1/auth/signup')
        .send({
          email,
          first_name,
          last_name,
          password,
        })
        .end((err, res) => {
          if (err) return;

          expect(res).to.have.status(400);
          expect(res.body.status).to.eql('error');
          expect(res.body.error).not.to.be.empty;
          done();
        });
    });
  });

  describe('POST /auth/signup - Invalid requests', () => {
    const email = 'test@test.com';
    const first_name = 'Michael';
    const last_name = 'Okeke';
    const password = 'superpassword';
    let client;

    before(async () => {
      client = await pool.connect();
      await client.query(
        'CREATE TABLE IF NOT EXISTS users(id SERIAL PRIMARY KEY, email VARCHAR UNIQUE NOT NULL, first_name VARCHAR(40) NOT NULL, last_name VARCHAR(40) NOT NULL, password VARCHAR NOT NULL, is_admin BOOLEAN DEFAULT false)',
      );

      const salt = await bcrypt.genSalt(Number(config.get('saltRound')));
      const hashedPassword = await bcrypt.hash(password, salt);
      await client.query({
        text: 'INSERT INTO users(email, first_name, last_name, password) VALUES($1, $2, $3, $4)',
        values: [email, first_name, last_name, hashedPassword],
      });
    });

    after(async () => {
      await client.query('DROP TABLE IF EXISTS users');
      client.release();
    });

    it('should return error and status code 400, when creating user with email already in database', (done) => {
      chai
        .request(server)
        .post('/api/v1/auth/signup')
        .send({
          email,
          first_name,
          last_name,
          password,
        })
        .end((err, res) => {
          if (err) return;

          expect(res).to.have.status(400);
          expect(res.body.status).to.eql('error');
          done();
        });
    });
  });

  describe('POST /auth/signin', () => {
    const email = 'test@test.com';
    const first_name = 'Michael';
    const last_name = 'Okeke';
    const password = 'superpassword';
    let details = { email, password };
    let client;

    before(async () => {
      client = await pool.connect();
      await client.query(
        'CREATE TABLE IF NOT EXISTS users(id SERIAL PRIMARY KEY, email VARCHAR UNIQUE NOT NULL, first_name VARCHAR(40) NOT NULL, last_name VARCHAR(40) NOT NULL, password VARCHAR NOT NULL, is_admin BOOLEAN DEFAULT false)',
      );

      const salt = await bcrypt.genSalt(Number(config.get('saltRound')));
      const hashedPassword = await bcrypt.hash(password, salt);
      await client.query({
        text: 'INSERT INTO users(email, first_name, last_name, password) VALUES($1, $2, $3, $4)',
        values: [email, first_name, last_name, hashedPassword],
      });
    });

    after(async () => {
      await client.query('DROP TABLE IF EXISTS users');
      client.release();
    });

    it('should be a function', () => {
      expect(user.signIn).to.be.a('function');
    });

    it('should return status code 200, on successful signin', (done) => {
      chai
        .request(server)
        .post('/api/v1/auth/signin')
        .send(details)
        .end((err, res) => {
          if (err) return;

          expect(res).to.have.status(200);
          done();
        });
    });

    it('should return users id, on successful signin', (done) => {
      chai
        .request(server)
        .post('/api/v1/auth/signin')
        .send(details)
        .end((err, res) => {
          expect(res.body.data.user_id).to.be.greaterThan(0);
          done();
        });
    });

    it('should return whether user is an admin with a boolean value, on successful signin', (done) => {
      chai
        .request(server)
        .post('/api/v1/auth/signin')
        .send(details)
        .end((err, res) => {
          expect(res.body.data.is_admin).to.be.a('boolean');
          done();
        });
    });

    it('should return status code 401 when supplied with invalid credentials', (done) => {
      details = { email: '', password: '' };
      chai
        .request(server)
        .post('/api/v1/auth/signin')
        .send(details)
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body.status).to.eql('error');
          done();
        });
    });
  });
});
