/* eslint-disable consistent-return */
/* eslint-disable no-console */
import pool from '../db';
import isEmpty from '../utils/isEmpty';

export default async (req, res, next) => {
  const {
    number_plate, manufacturer, model, year, capacity,
  } = req.body;

  if (isEmpty(number_plate) || isEmpty(capacity)) {
    req.status = 400;
    return next(new Error('both number_plate and capacity are required'));
  }

  const insertBus = {
    text:
      'INSERT INTO buses(number_plate, manufacturer, model, year, capacity) VALUES($1, $2, $3, $4, $5) RETURNING id, number_plate, capacity',
    values: [number_plate, manufacturer, model, year, capacity],
  };

  const client = await pool.connect();

  try {
    const { rows } = await client.query(insertBus);

    const { id } = rows[0];
    res.status(201).send({ status: 'success', data: { id, number_plate, capacity } });
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};