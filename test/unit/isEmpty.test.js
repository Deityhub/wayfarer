const { expect } = require('chai');
const isEmpty = require('../../utils/isEmpty');

describe('isEmpty Utils Function', () => {
  it('should be a function', () => {
    expect(isEmpty).to.be.a('function');
  });

  it('should return false when value passed to it is string', () => {
    const output = isEmpty('hello world');

    expect(output).to.be.a('boolean');
    expect(output).to.eql(false);
  });

  it('should return true when value passed to it is empty quote', () => {
    const output = isEmpty('');

    expect(output).to.be.a('boolean');
    expect(output).to.eql(true);
  });

  it('should return true when passed an invalid value', () => {
    const output = isEmpty(null);

    expect(output).to.be.a('boolean');
    expect(output).to.eql(true);
  });

  it('should return false when a non empty object is passed', () => {
    const output = isEmpty({ test: 'testing' });

    expect(output).to.be.a('boolean');
    expect(output).to.eql(false);
  });

  it('should return true when an empty object is passed', () => {
    const output = isEmpty({});

    expect(output).to.be.a('boolean');
    expect(output).to.eql(true);
  });

  it('should return false when a non empty array is passed', () => {
    const output = isEmpty([{ test: 'testing' }]);

    expect(output).to.be.a('boolean');
    expect(output).to.eql(false);
  });

  it('should return true when an empty array is passed', () => {
    const output = isEmpty([]);

    expect(output).to.be.a('boolean');
    expect(output).to.eql(true);
  });

  it('should return false when a number is passed', () => {
    const output = isEmpty(2);

    expect(output).to.be.a('boolean');
    expect(output).to.eql(false);
  });

  it('should return false if a boolean value is passed to it', () => {
    const output = isEmpty(true);

    expect(output).to.be.a('boolean');
    expect(output).to.eql(false);
  });
});
