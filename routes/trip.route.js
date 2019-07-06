const express = require('express');
const trip = require('../controllers/trip.controller');
const tokenAuth = require('../middlewares/tokenAuth');
const isAdmin = require('../middlewares/isAdmin');

const router = express.Router();

router.post('/trips', tokenAuth, isAdmin, trip.createTrip);

module.exports = router;
