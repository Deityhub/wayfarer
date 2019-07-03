module.exports = (val) => {
  if (val) {
    if (val.constructor.name === 'Object') return !Object.keys(val).length > 0;

    if (val.constructor.name === 'Array') return !val.length > 0;

    return !val.trim().length > 0;
  }

  return true;
};
