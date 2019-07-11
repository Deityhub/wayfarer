const pool = require('../db');

const createBooking = async (req, res, next) => {
  const { trip_id, user_id, seat_number } = req.body;

  const bookQuery = {
    text:
      'INSERT INTO bookings(trip_id, user_id, seat_number) VALUES($1, $2, $3) RETURNING id, trip_id, user_id, seat_number, created_on',
    values: [trip_id, user_id, seat_number],
  };

  const bookCompleteQuery = 'SELECT bookings.id booking_id, bookings.trip_id, bookings.user_id, bookings.created_on, bookings.seat_number, trips.bus_id, trips.origin, trips.destination, trips.trip_date, trips.fare, trips.status, users.first_name, users.last_name, users.email FROM bookings INNER JOIN trips ON (bookings.trip_id = trips.id) INNER JOIN users ON (bookings.user_id = users.id)';

  const client = await pool.connect();
  try {
    await client.query(
      'CREATE TABLE IF NOT EXISTS bookings(id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), trip_id UUID NOT NULL, user_id UUID NOT NULL, created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP, seat_number INTEGER NOT NULL, FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)',
    );

    await client.query(bookQuery);

    const { rows } = await client.query(bookCompleteQuery);
    res.status(201).send({ status: 'success', data: { ...rows[0] } });
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};

module.exports = { createBooking };
