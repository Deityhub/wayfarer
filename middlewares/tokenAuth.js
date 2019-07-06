const jwt = require('jsonwebtoken');
const config = require('config');
const isEmpty = require('../utils/isEmpty');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (isEmpty(authorization) || isEmpty(authorization.split(' ')[1])) {
    req.status = 401;
    return next(new Error('Unauthorized, you need to sign in'));
  }

  const token = authorization.split(' ')[1];
  // eslint-disable-next-line consistent-return
  jwt.verify(token, config.get('jwtKey'), (err, decoded) => {
    if (err) {
      req.status = 403;
      return next(new Error('Invalid token provided'));
    }

    req.is_admin = decoded.is_admin;
  });

  return next();
};
