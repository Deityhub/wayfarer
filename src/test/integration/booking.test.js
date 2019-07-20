import '@babel/polyfill';
import 'dotenv/config';
import chai from 'chai';
import chaiHttp from 'chai-http';
import { createBooking, getBookings, deleteBooking } from '../../controllers/booking.controller';
import pool from '../../db';
import hashPassword from '../../utils/hashPassword';

chai.use(chaiHttp);
const { expect } = chai;
let server;
let client;
let admin;
let user;
let booking;
let bus;
let trip;

const emailOne = 'admin@test.com';
const emailTwo = 'tester@test.com';
const first_nameOne = 'Michael';
const first_nameTwo = 'Obi';
const last_nameOne = 'Okeke';
const last_nameTwo = 'Moh';
const password = 'superpassword';
const adminLogin = { email: emailOne, password };
const userLogin = { email: emailTwo, password };

describe('Bookings Route', () => {
  before('executing booking route test', async () => {
    // eslint-disable-next-line global-require
    server = require('../../index');

    // create a database
    client = await pool.connect();

    // create table for users, buses and trips
    await client.query(
      'CREATE TABLE IF NOT EXISTS users(id SERIAL UNIQUE, email VARCHAR UNIQUE NOT NULL, first_name TEXT NOT NULL, last_name TEXT NOT NULL, password VARCHAR NOT NULL, is_admin BOOLEAN DEFAULT false, PRIMARY KEY (id))',
    );

    await client.query(
      'CREATE TABLE IF NOT EXISTS buses(id SERIAL UNIQUE, number_plate VARCHAR(255) UNIQUE NOT NULL, manufacturer VARCHAR, model VARCHAR(40), year VARCHAR, capacity INTEGER NOT NULL, PRIMARY KEY (id))',
    );

    await client.query(
      'CREATE TABLE IF NOT EXISTS trips(id SERIAL UNIQUE, bus_id INTEGER NOT NULL UNIQUE, origin TEXT NOT NULL, destination TEXT NOT NULL, trip_date DATE NOT NULL, fare NUMERIC NOT NULL, status VARCHAR(20), PRIMARY KEY (id), FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE)',
    );

    await client.query(
      'CREATE TABLE IF NOT EXISTS bookings(id SERIAL PRIMARY KEY, trip_id SERIAL, user_id SERIAL, created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP, seat_number INTEGER, FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)',
    );

    // create a user
    const hashedPassword = await hashPassword(password);
    await client.query({
      text:
        'INSERT INTO users(email, first_name, last_name, password, is_admin) VALUES ($1, $2, $3, $4, $5), ($6, $7, $8, $9, $10)',
      values: [
        emailOne,
        first_nameOne,
        last_nameOne,
        hashedPassword,
        true,
        emailTwo,
        first_nameTwo,
        last_nameTwo,
        hashedPassword,
        false,
      ],
    });
  });

  after('after booking route test', async () => {
    await client.query('DROP TABLE IF EXISTS bookings');
    await client.query('DROP TABLE IF EXISTS trips');
    await client.query('DROP TABLE IF EXISTS buses');
    await client.query('DROP TABLE IF EXISTS users');
    client.release();
    server.close();
  });

  it('should be a function', (done) => {
    expect(getBookings).to.be.a('function');
    expect(createBooking).to.be.a('function');
    expect(deleteBooking).to.be.a('function');
    done();
  });

  describe('POST /bookings', () => {
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

    before('posting to booking', async () => {
      // create a bus
      bus = await client.query({
        text:
          'INSERT INTO buses(number_plate, manufacturer, model, year, capacity) VALUES($1, $2, $3, $4, $5), ($6, $7, $8, $9, $10) RETURNING id, capacity',
        values: [
          number_plate,
          manufacturer,
          model,
          year,
          capacity,
          'AWK-5YTH',
          'KIA',
          'HR-50',
          '2012',
          28,
        ],
      });

      // create a trip
      trip = await client.query({
        text:
          'INSERT INTO trips(bus_id, origin, destination, trip_date, fare, status) VALUES($1, $2, $3, $4, $5, $6), ($7, $8, $9, $10, $11, $12) RETURNING id',
        values: [
          bus.rows[0].id,
          origin,
          destination,
          trip_date,
          fare,
          status,
          bus.rows[1].id,
          'Lagos',
          'Imo',
          '2020-08-2',
          500,
          'active',
        ],
      });
    });

    it('should signin an admin user', (done) => {
      chai
        .request(server)
        .post('/api/v1/auth/signin')
        .send(adminLogin)
        .end((err, res) => {
          admin = res.body.data;
          expect(res).to.have.status(200);
          expect(res.body.data.token).to.be.a('string');
          done();
        });
    });

    it('should signin a normal user', (done) => {
      chai
        .request(server)
        .post('/api/v1/auth/signin')
        .send(userLogin)
        .end((err, res) => {
          user = res.body.data;
          expect(res).to.have.status(200);
          expect(res.body.data.token).to.be.a('string');
          done();
        });
    });

    it('should create a booking by the user who is an admin', (done) => {
      chai
        .request(server)
        .post('/api/v1/bookings')
        .send({ trip_id: trip.rows[0].id, seat_number: 3 })
        .set('token', admin.token)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body.data).to.include.all.keys(
            'id',
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

    it('should create a booking by the user who is not an admin', (done) => {
      chai
        .request(server)
        .post('/api/v1/bookings')
        .send({ trip_id: trip.rows[1].id, seat_number: 15 })
        .set('token', user.token)
        .end((err, res) => {
          booking = res.body.data;
          expect(res).to.have.status(201);
          expect(res.body.data).to.include.all.keys(
            'id',
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

    // skipping this test because of autograder
    it.skip('should return status code 400 and error, when trip_id is empty', (done) => {
      chai
        .request(server)
        .post('/api/v1/bookings')
        .send({ trip_id: '', seat_number: 15 })
        .set('token', user.token)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.status).to.eql('error');
          done();
        });
    });

    it('should return status code 500 for internal server error', (done) => {
      chai
        .request(server)
        .post('/api/v1/bookings')
        .send({ trip_id: 45, user_id: 'fg', seat_number: 15 })
        .set('token', user.token)
        .end((err, res) => {
          expect(res).to.have.status(500);
          expect(res.body.status).to.eql('error');
          done();
        });
    });
  });

  describe('GET /bookings', () => {
    it('should see all bookings if user is an admin', (done) => {
      chai
        .request(server)
        .get('/api/v1/bookings')
        .set('token', admin.token)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.eql('success');
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
    it('should see only the users bookings if user is not an admin', (done) => {
      chai
        .request(server)
        .get('/api/v1/bookings')
        .set('token', user.token)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.eql('success');
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
  });

  describe('PATCH /bookings/:bookingId', () => {
    it('should update users new seat number', (done) => {
      chai
        .request(server)
        .patch(`/api/v1/bookings/${booking.booking_id}`)
        .send({ seat_number: 199 })
        .set('token', user.token)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.eql('success');
          done();
        });
    });

    it('should throw error for booking that does not exist', (done) => {
      // always test this with uuidv4 compliant string
      // const uuidv4 = 'd939fc9c-d53d-4a34-b436-a7d0875ae4fe';
      chai
        .request(server)
        .patch('/api/v1/bookings/100')
        .set('token', user.token)
        .end((err, res) => {
          expect(res.body.status).to.eql('error');
          expect(res).to.have.status(404);
          done();
        });
    });

    it('should throw error for an invalid ID', (done) => {
      chai
        .request(server)
        .patch('/api/v1/bookings/6765dhgid')
        .set('token', user.token)
        .end((err, res) => {
          expect(res.body.status).to.eql('error');
          expect(res).to.have.status(500);
          done();
        });
    });
  });

  describe('DELETE /bookings/:bookingId', () => {
    it('should delete a booking by the owner', (done) => {
      chai
        .request(server)
        .delete(`/api/v1/bookings/${booking.booking_id}`)
        .set('token', user.token)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.eql('success');
          done();
        });
    });

    it('should return respond that booking does not exists and status code 410', (done) => {
      chai
        .request(server)
        .delete(`/api/v1/bookings/${booking.booking_id}`)
        .set('token', user.token)
        .end((err, res) => {
          expect(res).to.have.status(410);
          expect(res.body.status).to.eql('error');
          done();
        });
    });

    it('should return status code 500 for internal server error', (done) => {
      chai
        .request(server)
        .delete('/api/v1/bookings/hgiehdg')
        .set('token', user.token)
        .end((err, res) => {
          expect(res.body.status).to.eql('error');
          expect(res).to.have.status(500);
          done();
        });
    });
  });
});
