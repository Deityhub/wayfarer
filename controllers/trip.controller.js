/* eslint-disable consistent-return */
/* eslint-disable no-console */
const pool = require('../db');
const isEmpty = require('../utils/isEmpty');

const createTrip = async (req, res, next) => {
  const {
    bus_id, origin, destination, trip_date, fare,
  } = req.body;
  let { status } = req.body;

  if (
    isEmpty(bus_id)
    || isEmpty(origin)
    || isEmpty(destination)
    || isEmpty(trip_date)
    || isEmpty(fare)
  ) {
    req.status = 400;
    return next(new Error('All the fields are required'));
  }

  status = isEmpty(status) ? 'active' : status;

  const tripTable = 'CREATE TABLE IF NOT EXISTS trips(id UUID DEFAULT uuid_generate_v4(), bus_id UUID NOT NULL UNIQUE, origin TEXT NOT NULL, destination TEXT NOT NULL, trip_date DATE NOT NULL, fare NUMERIC NOT NULL, status VARCHAR(20), PRIMARY KEY (id, bus_id), FOREIGN KEY (bus_id) REFERENCES buses(id))';

  const tripQuery = {
    text:
      'INSERT INTO trips(bus_id, origin, destination, trip_date, fare, status) VALUES($1, $2, $3, $4, $5, $6) RETURNING id, bus_id, origin, destination, trip_date, fare, status',
    values: [bus_id, origin, destination, trip_date, fare, status],
  };

  const client = await pool.connect();

  try {
    await client.query(tripTable);

    const { rows } = await client.query(tripQuery);

    const { id } = rows[0];
    res.status(201).send({
      status: 'success',
      data: {
        trip_id: id,
        bus_id,
        origin,
        destination,
        trip_date,
        fare,
        status,
      },
    });
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};

const getAllTrips = async (req, res, next) => {
  const tripQuery = 'SELECT * FROM trips';
  const client = await pool.connect();

  try {
    const { rows } = await client.query(tripQuery);

    res.status(200).send({ status: 'success', data: rows });
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};

module.exports = { createTrip, getAllTrips };
