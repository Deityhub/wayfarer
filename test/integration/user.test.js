/* eslint-disable no-unused-expressions */
/* eslint-disable camelcase */
require('dotenv').config();
const chai = require('chai');
const chaiHttp = require('chai-http');

const pool = require('../../db');
const user = require('../../controllers/user.controller');

const { expect } = chai;
chai.use(chaiHttp);

let server;

describe('User Test', () => {
  before(() => {
    // eslint-disable-next-line global-require
    server = require('../../index');
  });
  after(() => {
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
    });

    after(async () => {
      await client.query('DROP TABLE IF EXISTS users');
      client.release();
    });

    it('should create a user', (done) => {
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
          done();
        });
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
});
