const express = require('express');
const tokenAuth = require('../middlewares/tokenAuth');
const { createBooking, getBookings } = require('../controllers/booking.controller');

const router = express.Router();

router.post('/bookings', tokenAuth, createBooking);
router.get('/bookings', tokenAuth, getBookings);

module.exports = router;
