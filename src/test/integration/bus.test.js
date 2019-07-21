import '@babel/polyfill';
import 'dotenv/config';
import chai from 'chai';
import chaiHttp from 'chai-http';
import { createBus, getBuses } from '../../controllers/bus.controller';
import pool from '../../db';
import hashPassword from '../../utils/hashPassword';

const { expect } = chai;
chai.use(chaiHttp);
let server;
let user;
let client;

describe('Bus Routes', () => {
  before('testing bus routes', async () => {
    // eslint-disable-next-line global-require
    server = require('../../index');
    client = await pool.connect();
  });

  after('testing bus routes', async () => {
    await client.query('DROP TABLE IF EXISTS buses');
    await client.query('DROP TABLE IF EXISTS users');
    client.release();
    server.close();
  });

  it('should be a function', () => {
    expect(createBus).to.be.a('function');
    expect(getBuses).to.be.a('function');
  });

  describe('POST /bus', () => {
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

    before(async () => {
      await client.query(
        'CREATE TABLE IF NOT EXISTS buses(id SERIAL UNIQUE, number_plate VARCHAR(255) UNIQUE NOT NULL, manufacturer VARCHAR, model VARCHAR(40), year VARCHAR, capacity INTEGER NOT NULL, PRIMARY KEY (id))',
      );

      await client.query(
        'CREATE TABLE IF NOT EXISTS users(id SERIAL UNIQUE, email VARCHAR UNIQUE NOT NULL, first_name TEXT NOT NULL, last_name TEXT NOT NULL, password VARCHAR NOT NULL, is_admin BOOLEAN DEFAULT false, PRIMARY KEY (id))',
      );

      const hashedPassword = await hashPassword(password);
      await client.query({
        text:
          'INSERT INTO users(email, first_name, last_name, password, is_admin) VALUES($1, $2, $3, $4, $5) RETURNING id, is_admin, email',
        values: [email, first_name, last_name, hashedPassword, true],
      });
    });

    /* after(async () => {
      await client.query('DROP TABLE IF EXISTS buses');
      await client.query('DROP TABLE IF EXISTS users');
      client.release();
    }); */

    it('should signin a user', (done) => {
      chai
        .request(server)
        .post('/api/v1/auth/signin')
        .send(details)
        .end((err, res) => {
          user = res.body.data;
          expect(res).to.have.status(200);
          expect(res.body.data.token).to.be.a('string');
          done();
        });
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

    it('should return status code 400 and error when creating a bus with number plate already in the database', (done) => {
      chai
        .request(server)
        .post('/api/v1/bus')
        .set('token', user.token)
        .send(busData)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.status).to.eql('error');
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

  describe('GET /bus', () => {
    it('should return all the buses in the database', (done) => {
      chai
        .request(server)
        .get('/api/v1/bus')
        .set('token', user.token)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.eql('success');
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
  });
});
