/* eslint-disable camelcase */
require('dotenv').config();
const bcrypt = require('bcrypt');
const config = require('config');
const chai = require('chai');
const chaiHttp = require('chai-http');
const isAdmin = require('../../middlewares/isAdmin');
const pool = require('../../db');

chai.use(chaiHttp);
const { expect } = chai;
let server;

describe('Authorization for Admin Role', () => {
  before(() => {
    // eslint-disable-next-line global-require
    server = require('../../index');
  });

  after(() => {
    server.close();
  });

  describe('POST /api/v1/bus', () => {
    const email = 'test@test.com';
    const first_name = 'Michael';
    const last_name = 'Okeke';
    const password = 'superpassword';
    const details = { email, password };
    let client;
    let user;

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

    it('should signin a user', (done) => {
      chai
        .request(server)
        .post('/api/v1/auth/signin')
        .send(details)
        .end((err, res) => {
          user = res.body.data;
          expect(res).to.have.status(200);
          expect(res.body.data.user_id).to.be.greaterThan(0);
          expect(res.body.data.token).to.be.a('string');
          done();
        });
    });

    it('should be a function', () => {
      expect(isAdmin).to.be.a('function');
    });

    it('should return status code 403 if not admin', (done) => {
      chai
        .request(server)
        .post('/api/v1/bus')
        .set('Authorization', `Bearer ${user.token}`)
        .end((err, res) => {
          expect(res).to.have.status(403);
          done();
        });
    });
  });
});
