/* eslint-disable camelcase */
require('dotenv').config();
const config = require('config');
const bcrypt = require('bcrypt');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { createTrip, getAllTrips } = require('../../controllers/trip.controller');
const pool = require('../../db');

const { expect } = chai;
chai.use(chaiHttp);
let server;
let client;

describe('Trip Routes', () => {
  const email = 'test@test.com';
  const first_name = 'Michael';
  const last_name = 'Okeke';
  const password = 'superpassword';
  const details = { email, password };
  let user;

  before('testing trip routes', async () => {
    // eslint-disable-next-line global-require
    server = require('../../index');

    client = await pool.connect();

    await client.query(
      'CREATE TABLE IF NOT EXISTS users(id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), email VARCHAR UNIQUE NOT NULL, first_name VARCHAR(40) NOT NULL, last_name VARCHAR(40) NOT NULL, password VARCHAR NOT NULL, is_admin BOOLEAN DEFAULT false)',
    );

    const salt = await bcrypt.genSalt(Number(config.get('saltRound')));
    const hashedPassword = await bcrypt.hash(password, salt);
    await client.query({
      text:
        'INSERT INTO users(email, first_name, last_name, password, is_admin) VALUES($1, $2, $3, $4, $5) RETURNING id, is_admin, email',
      values: [email, first_name, last_name, hashedPassword, true],
    });
  });

  after('testing trip routes', async () => {
    await client.query('DROP TABLE IF EXISTS trips');
    await client.query('DROP TABLE IF EXISTS buses CASCADE');
    await client.query('DROP TABLE IF EXISTS users');
    server.close();
    client.release();
  });

  describe('POST /api/v1/trip', () => {
    const number_plate = 'HIEH034-4';
    const manufacturer = 'Toyota';
    const model = 'LS343';
    const year = '2009';
    const capacity = 12;

    let bus;

    before(async () => {
      await client.query(
        'CREATE TABLE IF NOT EXISTS buses(id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), number_plate VARCHAR(255) UNIQUE NOT NULL, manufacturer VARCHAR, model VARCHAR(40), year VARCHAR, capacity INTEGER NOT NULL)',
      );

      bus = await client.query({
        text:
          'INSERT INTO buses(number_plate, manufacturer, model, year, capacity) VALUES($1, $2, $3, $4, $5) RETURNING id',
        values: [number_plate, manufacturer, model, year, capacity],
      });
    });
      
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

    it('should be a function', () => {
      expect(createTrip).to.be.a('function');
    });

    it('should create a trip successfully by an admin', (done) => {
      const trip = {
        bus_id: bus.rows[0].id,
        origin: 'Onitsha',
        destination: 'Enugu',
        trip_date: '2019-08-2',
        fare: 780,
      };

      chai
        .request(server)
        .post('/api/v1/trips')
        .send(trip)
        .set('Authorization', `Bearer ${user.token}`)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body.data.origin).to.eql(trip.origin);
          expect(res.body.data.destination).to.eql(trip.destination);
          done();
        });
    });

    it.skip('should not create a trip if user is not an admin', (done) => {
      const trip = {
        bus_id: bus.rows[0].id,
        origin: 'Onitsha',
        destination: 'Enugu',
        trip_date: '2019-08-2',
        fare: 780,
      };

      chai
        .request(server)
        .post('/api/v1/trips')
        .send(trip)
        .set('Authorization', `Bearer ${user.token}`)
        .end((err, res) => {
          expect(res).to.have.status(403);
          expect(res.body.status).to.eql('error');
          done();
        });
    });

    it('should throw error when creating trip with same bus id', (done) => {
      const trip = {
        bus_id: bus.rows[0].id,
        origin: 'Onitsha',
        destination: 'Enugu',
        trip_date: '2019-08-2',
        fare: 780,
      };

      chai
        .request(server)
        .post('/api/v1/trips')
        .send(trip)
        .set('Authorization', `Bearer ${user.token}`)
        .end((err, res) => {
          expect(res).to.have.status(500);
          done();
        });
    });
  });

  describe('GET /api/v1/trips', () => {
    it('should be a function', () => {
      expect(getAllTrips).to.be.a('function');
    });

    it('should see all the available trips', (done) => {
      chai
        .request(server)
        .get('/api/v1/trips')
        .set('Authorization', `Bearer ${user.token}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.eql('success');
          done();
        });
    });
  });
});
