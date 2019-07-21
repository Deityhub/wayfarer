import express from 'express';
import { createBus, getBuses } from '../controllers/bus.controller';
import tokenAuth from '../middlewares/tokenAuth';
import isAdmin from '../middlewares/isAdmin';

const router = express.Router();

router.post('/bus', tokenAuth, isAdmin, createBus);
router.get('/bus', tokenAuth, isAdmin, getBuses);

export default router;
