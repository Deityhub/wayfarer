import express from 'express';
import createBus from '../controllers/bus.controller';
import tokenAuth from '../middlewares/tokenAuth';
import isAdmin from '../middlewares/isAdmin';

const router = express.Router();

router.post('/bus', tokenAuth, isAdmin, createBus);

export default router;
