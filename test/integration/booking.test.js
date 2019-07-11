require('dotenv').config();
const chai = require('chai');
const chaiHttp = require('chai-http');
const { createBooking } = require('../../controllers/booking.controller');
const pool = require('../../db');
const hashPassword = require('../../utils/hashPassword');

chai.use(chaiHttp);
const { expect } = chai;
let server;
let client;

describe('Bookings Route', () => {
  before('executing booking route test', async () => {
    // eslint-disable-next-line global-require
    server = require('../../index');

    // create a database
    client = await pool.connect();

    // create table for users, buses and trips
    await client.query(
      'CREATE TABLE IF NOT EXISTS users(id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), email VARCHAR UNIQUE NOT NULL, first_name VARCHAR(40) NOT NULL, last_name VARCHAR(40) NOT NULL, password VARCHAR NOT NULL, is_admin BOOLEAN DEFAULT false)',
    );

    await client.query(
      'CREATE TABLE IF NOT EXISTS buses(id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), number_plate VARCHAR(255) UNIQUE NOT NULL, manufacturer VARCHAR, model VARCHAR(40), year VARCHAR, capacity INTEGER NOT NULL)',
    );

    await client.query(
      'CREATE TABLE IF NOT EXISTS trips(id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), bus_id UUID NOT NULL UNIQUE, origin TEXT NOT NULL, destination TEXT NOT NULL, trip_date DATE NOT NULL, fare NUMERIC NOT NULL, status VARCHAR(20), FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE)',
    );
  });

  after('after booking route test', async () => {
    await client.query('DROP TABLE IF EXISTS bookings');
    await client.query('DROP TABLE IF EXISTS trips');
    await client.query('DROP TABLE IF EXISTS buses');
    await client.query('DROP TABLE IF EXISTS users');
    client.release();
    server.close();
  });
  describe('POST /bookings', () => {
    let bus;
    let trip;
    let user;

    const number_plate = 'HIEHGT4-4';
    const manufacturer = 'Toyota';
    const model = 'LS343';
    const year = '2009';
    const capacity = 12;

    const origin = 'Onitsha';
    const destination = 'Enugu';
    const trip_date = '2019-08-2';
    const fare = 780;
    const status = 'active';

    const email = 'bet@test.com';
    const first_name = 'Michael';
    const last_name = 'Okeke';
    const password = 'superpassword';
    const details = { email, password };

    before(async () => {
      // create a user
      const hashedPassword = await hashPassword(password);
      await client.query({
        text:
          'INSERT INTO users(email, first_name, last_name, password, is_admin) VALUES($1, $2, $3, $4, $5) RETURNING id, is_admin, email',
        values: [email, first_name, last_name, hashedPassword, true],
      });

      // create a bus
      bus = await client.query({
        text:
          'INSERT INTO buses(number_plate, manufacturer, model, year, capacity) VALUES($1, $2, $3, $4, $5) RETURNING id, capacity',
        values: [number_plate, manufacturer, model, year, capacity],
      });

      // create a trip
      trip = await client.query({
        text:
          'INSERT INTO trips(bus_id, origin, destination, trip_date, fare, status) VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
        values: [bus.rows[0].id, origin, destination, trip_date, fare, status],
      });
    });

    afterEach(() => {});

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

    it('should return a function', () => {
      expect(createBooking).to.be.a('function');
    });

    it('should create a booking by the user', (done) => {
      chai
        .request(server)
        .post('/api/v1/bookings')
        .send({ trip_id: trip.rows[0].id, user_id: user.user_id, seat_number: 3 })
        .set('Authorization', `Bearer ${user.token}`)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body.data).to.include.all.keys(
            'booking_id',
            'trip_id',
            'user_id',
            'trip_date',
            'seat_number',
            'bus_id',
            'email',
          );
          done();
        });
    });
  });
});
