module.exports = (val) => {
  if (val) return !val.trim().length > 0;

  return true;
};
