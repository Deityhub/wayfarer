import { expect } from 'chai';
import hashPassword from '../../utils/hashPassword';

describe('Hash Password', () => {
  it('should be a function', () => {
    expect(hashPassword).to.be.a('function');
  });

  it('should return a hashed password', () => hashPassword('hello world').then((res) => {
    expect(res.length).to.greaterThan(10);
  }));
});
