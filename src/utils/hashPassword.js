import config from 'config';
import bcrypt from 'bcrypt';

export default async (password) => {
  const salt = await bcrypt.genSalt(Number(config.get('saltRound')));
  return bcrypt.hash(password, salt);
};
