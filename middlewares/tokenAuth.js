import jwt from 'jsonwebtoken';
import config from 'config';
import isEmpty from '../utils/isEmpty';

export default (req, res, next) => {
  const { token } = req.headers;

  if (isEmpty(token)) {
    req.status = 401;
    return next(new Error('Unauthorized, you need to sign in'));
  }

  // eslint-disable-next-line consistent-return
  jwt.verify(token, config.get('jwtKey'), (err, decoded) => {
    if (err) {
      req.status = 403;
      return next(new Error('Invalid token provided'));
    }

    req.user = decoded;
  });

  return next();
};
