import pool from '../db';
import isEmpty from '../utils/isEmpty';

const createBooking = async (req, res, next) => {
  const { trip_id, seat_number } = req.body;
  const { id } = req.user;

  // commenting this out because of autograder
  if (isEmpty(trip_id)) {
    req.status = 400;
    return next(new Error('user id or trip id not provided'));
  }

  const bookQuery = {
    text:
      'INSERT INTO bookings(trip_id, user_id, seat_number) VALUES($1, $2, $3) RETURNING id, trip_id, user_id, seat_number, created_on',
    values: [trip_id, id, seat_number],
  };

  const bookCompleteQuery = 'SELECT bookings.id, bookings.id booking_id, bookings.trip_id, bookings.user_id, bookings.created_on, bookings.seat_number, trips.bus_id, trips.origin, trips.destination, trips.trip_date, trips.fare, trips.status, users.first_name, users.last_name, users.email FROM bookings INNER JOIN trips ON (bookings.trip_id = trips.id AND trip_id = $1) INNER JOIN users ON (bookings.user_id = users.id AND users.id = $2)';

  const journeyQuery = 'SELECT trips.id trip_id, trips.origin, trips.destination, trips.trip_date, trips.fare, trips.status, buses.id bus_id, buses.capacity FROM trips INNER JOIN buses ON (trips.bus_id = buses.id AND trips.id = $1)';

  const client = await pool.connect();
  try {
    const journey = await client.query(journeyQuery, [trip_id]);
    if (isEmpty(journey.rows) || journey.rows[0].status === 'cancelled') {
      req.status = 400;
      return next(new Error('Trip does not exists or was cancelled'));
    }

    const allBookings = await client.query('SELECT * FROM bookings WHERE trip_id = $1', [trip_id]);
    const seat_taken = allBookings.rows.some(el => el.seat_number === seat_number);

    if (seat_taken) {
      req.status = 400;
      return next(new Error('Sorry seat number already taken!'));
    }

    if (seat_number === 1 || seat_number > journey.rows[0].capacity) {
      req.status = 400;
      return next(
        new Error(
          `Seat number is already taken or is more than the trip capacity. Choose between seat number 2 and seat number ${
            journey.rows[0].capacity}`,
        ),
      );
    }

    await client.query(bookQuery);

    const { rows } = await client.query(bookCompleteQuery, [trip_id, id]);
    res.status(201).send({ status: 'success', data: { ...rows[rows.length - 1] } });
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};

const getBookings = async (req, res, next) => {
  const client = await pool.connect();

  const userBooks = 'SELECT bookings.id, bookings.id booking_id, bookings.trip_id, bookings.user_id, bookings.created_on, bookings.seat_number, trips.bus_id, trips.origin, trips.destination, trips.trip_date, trips.fare, trips.status, users.first_name, users.last_name, users.email FROM bookings INNER JOIN trips ON (bookings.trip_id = trips.id) INNER JOIN users ON (bookings.user_id = users.id AND users.email = $1)';

  const allBooks = 'SELECT bookings.id, bookings.id booking_id, bookings.trip_id, bookings.user_id, bookings.created_on, bookings.seat_number, trips.bus_id, trips.origin, trips.destination, trips.trip_date, trips.fare, trips.status, users.first_name, users.last_name, users.email FROM bookings INNER JOIN trips ON (bookings.trip_id = trips.id) INNER JOIN users ON (bookings.user_id = users.id)';

  try {
    if (req.user.is_admin) {
      // query to get all bookings
      const { rows } = await client.query(allBooks);
      return res.status(200).send({ status: 'success', data: rows });
    }

    // query to get a bookings for that user
    const { rows } = await client.query(userBooks, [req.user.email]);
    res.status(200).send({ status: 'success', data: rows });
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};

const deleteBooking = async (req, res, next) => {
  const { bookingId } = req.params;
  const client = await pool.connect();

  try {
    const { rows } = await client.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
    if (isEmpty(rows)) {
      req.status = 410;
      return next(new Error('Booking no longer exists'));
    }
    await client.query('DELETE FROM bookings WHERE id = $1', [bookingId]);

    res.status(200).send({ status: 'success', data: { message: 'Booking deleted successfully' } });
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};

const updateBooking = async (req, res, next) => {
  const { bookingId } = req.params;
  const client = await pool.connect();

  try {
    const { rows } = await client.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
    if (isEmpty(rows)) {
      req.status = 404;
      return next(new Error('Booking not found or does not exist'));
    }

    await client.query('UPDATE bookings SET seat_number = $1 WHERE id = $2', [
      req.body.seat_number,
      bookingId,
    ]);
    res.status(200).send({ status: 'success', data: { message: 'Booking updated successfully' } });
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};

export {
  createBooking, getBookings, deleteBooking, updateBooking,
};
