import jwt from 'jsonwebtoken';
import config from 'config';

export default payload => jwt.sign(payload, config.get('jwtKey'), { expiresIn: '1h' });
