const express = require('express');
const bus = require('../controllers/bus.controller');
const tokenAuth = require('../middlewares/tokenAuth');
const isAdmin = require('../middlewares/isAdmin');

const router = express.Router();

router.post('/bus', tokenAuth, isAdmin, bus.createBus);

module.exports = router;
