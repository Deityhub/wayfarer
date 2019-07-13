const express = require('express');
const tokenAuth = require('../middlewares/tokenAuth');
const {
  createBooking,
  getBookings,
  deleteBooking,
  updateBooking,
} = require('../controllers/booking.controller');

const router = express.Router();

router.post('/bookings', tokenAuth, createBooking);
router.get('/bookings', tokenAuth, getBookings);
router.patch('/bookings/:bookingId', tokenAuth, updateBooking);
router.delete('/bookings/:bookingId', tokenAuth, deleteBooking);

module.exports = router;
