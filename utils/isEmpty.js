/* eslint-disable no-nested-ternary */
module.exports = val => (!val
  ? true
  : val.constructor.name === 'Object'
    ? !Object.keys(val).length > 0
    : val.constructor.name === 'Array'
      ? !val.length > 0
      : val.constructor.name === 'Boolean'
        ? false
        : val.constructor.name === 'Number'
          ? false
          : !val.trim().length > 0);
