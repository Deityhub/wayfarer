const express = require('express');
const { createTrip, getAllTrips, cancelTrip, getTrip } = require('../controllers/trip.controller');
const tokenAuth = require('../middlewares/tokenAuth');
const isAdmin = require('../middlewares/isAdmin');

const router = express.Router();

router.post('/trips', tokenAuth, isAdmin, createTrip);
router.get('/trips', tokenAuth, getAllTrips);
router.patch('/trips/:tripId', tokenAuth, isAdmin, cancelTrip);

module.exports = router;
