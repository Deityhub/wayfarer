require('dotenv').config();
const chai = require('chai');
const chaiHttp = require('chai-http');
const { createBus } = require('../../controllers/bus.controller');
const pool = require('../../db');
const hashPassword = require('../../utils/hashPassword');

const { expect } = chai;
chai.use(chaiHttp);
let server;

describe('Bus Routes', () => {
  before('testing bus routes', () => {
    // eslint-disable-next-line global-require
    server = require('../../index');
  });

  after('testing bus routes', () => {
    server.close();
  });

  describe('POST /api/v1/bus', () => {
    const number_plate = 'AWK-45HU';
    const manufacturer = 'Toyota';
    const model = 'LS300';
    const year = '2012';
    const capacity = 12;
    const busData = {
      number_plate,
      manufacturer,
      model,
      year,
      capacity,
    };

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
        'CREATE TABLE IF NOT EXISTS buses(id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), number_plate VARCHAR(255) UNIQUE NOT NULL, manufacturer VARCHAR, model VARCHAR(40), year VARCHAR, capacity INTEGER NOT NULL)',
      );

      await client.query(
        'CREATE TABLE IF NOT EXISTS users(id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), email VARCHAR UNIQUE NOT NULL, first_name VARCHAR(40) NOT NULL, last_name VARCHAR(40) NOT NULL, password VARCHAR NOT NULL, is_admin BOOLEAN DEFAULT false)',
      );

      const hashedPassword = await hashPassword(password);
      await client.query({
        text:
          'INSERT INTO users(email, first_name, last_name, password, is_admin) VALUES($1, $2, $3, $4, $5) RETURNING id, is_admin, email',
        values: [email, first_name, last_name, hashedPassword, true],
      });
    });

    after(async () => {
      await client.query('DROP TABLE IF EXISTS buses');
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
          expect(res.body.data.user_id.length).to.be.greaterThan(0);
          expect(res.body.data.token).to.be.a('string');
          done();
        });
    });

    it('should be a function', () => {
      expect(createBus).to.be.a('function');
    });

    it('should create a bus', (done) => {
      chai
        .request(server)
        .post('/api/v1/bus')
        .set('token', user.token)
        .send(busData)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body.status).to.eql('success');
          done();
        });
    });

    it('should return error and status code 400, if number_plate and/or capacity is empty', (done) => {
      const data = {
        manufacturer,
        model,
        year,
      };

      chai
        .request(server)
        .post('/api/v1/bus')
        .set('token', user.token)
        .send(data)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.status).to.eql('error');
          done();
        });
    });

    it("should throw error and status code 500 when it's internal server error", (done) => {
      chai
        .request(server)
        .post('/api/v1/bus')
        .set('token', user.token)
        .send({ number_plate: 454, capacity: 'hello' })
        .end((err, res) => {
          expect(res).to.have.status(500);
          expect(res.body.status).to.eql('error');
          done();
        });
    });
  });
});
