const express = require('express');
const user = require('../controllers/user.controller');

const router = express.Router();

router.post('/auth/signin', user.signIn);
router.post('/auth/signup', user.signUp);

module.exports = router;
