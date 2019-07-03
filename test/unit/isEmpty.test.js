const { expect } = require('chai');
const isEmpty = require('../../utils/isEmpty');

describe('isEmpty Utils Function', () => {
  it('should be a function', () => {
    expect(isEmpty).to.be.a('function');
  });

  it('should return false when value passed to it is not empty', () => {
    const output = isEmpty('hello world');

    expect(output).to.be.a('boolean');
    expect(output).to.eql(false);
  });

  it('should return true when value passed to it is empty', () => {
    const output = isEmpty('');

    expect(output).to.be.a('boolean');
    expect(output).to.eql(true);
  });

  it('should return true when passed an invalid value', () => {
    const output = isEmpty(null);

    expect(output).to.eql(true);
  });
});
