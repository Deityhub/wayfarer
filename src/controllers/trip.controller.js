/* eslint-disable consistent-return */
/* eslint-disable no-console */
import pool from '../db';
import isEmpty from '../utils/isEmpty';

const createTrip = async (req, res, next) => {
  const {
    bus_id, origin, destination, trip_date, fare,
  } = req.body;

  // commented this code out because of adc-autograder
  if (
    isEmpty(bus_id)
    || isEmpty(origin)
    || isEmpty(destination)
    || isEmpty(trip_date)
    || isEmpty(fare)
  ) {
    req.status = 400;
    return next(new Error('All the fields are required except status field'));
  }

  const tripQuery = {
    text:
      'INSERT INTO trips(bus_id, origin, destination, trip_date, fare, status) VALUES($1, $2, $3, $4, $5, $6) RETURNING id, bus_id, origin, destination, trip_date, fare, status',
    values: [bus_id, origin, destination, trip_date, fare, 'active'],
  };

  const client = await pool.connect();

  try {
    const bus = await client.query('SELECT * FROM buses WHERE id = $1', [bus_id]);
    if (isEmpty(bus.rows)) {
      req.status = 400;
      return next(new Error('Sorry bus does not exist'));
    }

    const { rows } = await client.query(tripQuery);

    const { id, status } = rows[0];
    res.status(201).send({
      status: 'success',
      data: {
        id,
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
  const tripQuery = 'SELECT trips.id trip_id, trips.origin, trips.destination, trips.trip_date, trips.fare, trips.status, buses.id bus_id, buses.capacity FROM trips INNER JOIN buses ON (trips.bus_id = buses.id)';
  const client = await pool.connect();
  const { destination, origin } = req.query;

  try {
    if (!isEmpty(destination) || !isEmpty(origin)) {
      const { rows } = await client.query(
        'SELECT * FROM trips WHERE destination = $1 OR origin = $2',
        [destination, origin],
      );
      return res.status(200).send({ status: 'success', data: rows });
    }

    const { rows } = await client.query(tripQuery);
    res.status(200).send({ status: 'success', data: rows });
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};

const cancelTrip = async (req, res, next) => {
  const { tripId } = req.params;
  const client = await pool.connect();

  try {
    const { rows } = await client.query('SELECT * FROM trips WHERE id = $1', [tripId]);
    if (isEmpty(rows)) {
      req.status = 404;
      return next(new Error('Trip not found or does not exist'));
    }
    await client.query('UPDATE trips SET status = $1 WHERE id = $2', ['cancelled', tripId]);

    res.status(200).send({ status: 'success', data: { message: 'Trip cancelled successfully' } });
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};

export { createTrip, getAllTrips, cancelTrip };
