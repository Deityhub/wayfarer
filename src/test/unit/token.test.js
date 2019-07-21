import { expect } from 'chai';
import config from 'config';
import jwt from 'jsonwebtoken';
import token from '../../utils/token';

describe('Assign JWT Token', () => {
  it('should be a function', () => {
    expect(token).to.be.a('function');
  });

  it('should return a jwt token with the correct payload', () => {
    const payload = { user_id: 'userid', is_admin: false };
    const jwtToken = token(payload);
    jwt.verify(token, config.get('jwtKey'), (err, decoded) => {
      if (err) return;

      expect(decoded).to.contain(payload);
      expect(jwtToken.length).to.greaterThan(10);
    });
  });
});
