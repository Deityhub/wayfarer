const config = require('config');
const bcrypt = require('bcrypt');

module.exports = async (password) => {
  const salt = await bcrypt.genSalt(Number(config.get('saltRound')));
  return bcrypt.hash(password, salt);
};
