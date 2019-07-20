/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import isValidEmail from '../../utils/isValidEmail';

describe('Check Email Validity', () => {
  it('should be a function', () => {
    expect(isValidEmail).to.be.a('function');
  });

  it('should return false with invalid email', () => {
    expect(isValidEmail('ab@ab')).to.be.false;
  });

  it('should return true with valid email', () => {
    expect(isValidEmail('test@test.com')).to.be.true;
  });
});
