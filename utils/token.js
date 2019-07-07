const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = payload => jwt.sign(payload, config.get('jwtKey'), { expiresIn: '1h' });
