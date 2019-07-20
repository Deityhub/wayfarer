import express from 'express';
import { signUp, signIn } from '../controllers/user.controller';

const router = express.Router();

router.post('/auth/signin', signIn);
router.post('/auth/signup', signUp);

export default router;
