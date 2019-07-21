import express from 'express';
import tokenAuth from '../middlewares/tokenAuth';
import {
  createBooking,
  getBookings,
  deleteBooking,
  updateBooking,
} from '../controllers/booking.controller';

const router = express.Router();

router.post('/bookings', tokenAuth, createBooking);
router.get('/bookings', tokenAuth, getBookings);
router.patch('/bookings/:bookingId', tokenAuth, updateBooking);
router.delete('/bookings/:bookingId', tokenAuth, deleteBooking);

export default router;
