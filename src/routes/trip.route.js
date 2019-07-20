import express from 'express';
import { createTrip, getAllTrips, cancelTrip } from '../controllers/trip.controller';
import tokenAuth from '../middlewares/tokenAuth';
import isAdmin from '../middlewares/isAdmin';

const router = express.Router();

router.post('/trips', tokenAuth, isAdmin, createTrip);
router.get('/trips', tokenAuth, getAllTrips);
router.patch('/trips/:tripId', tokenAuth, isAdmin, cancelTrip);

export default router;
