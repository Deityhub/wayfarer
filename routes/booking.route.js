const express = require('express');
const tokenAuth = require('../middlewares/tokenAuth');
const { createBooking } = require('../controllers/booking.controller');

const router = express.Router();

router.post('/bookings', tokenAuth, createBooking);

module.exports = router;
