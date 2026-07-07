const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcrypt');
const AppError = require('../utils/AppError');

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS, 10) || 10;

exports.register = async ({ username, password, role }) => {
  const existing = await userRepository.findByUsername(username);
  if (existing) {
    throw new AppError('Username already taken', 400);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userRepository.create({
    username,
    password: hashedPassword,
    role: role || 'user'
  });

  return { user: { id: user._id, username: user.username, role: user.role } };
};

exports.login = async ({ username, password }) => {
  const user = await userRepository.findByUsername(username);
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new AppError('Invalid credentials', 401);
  }

  return { user: { id: user._id, username: user.username, role: user.role } };
};

exports.logout = async () => {
  return { message: 'Logout successful - please discard your stored credentials' };
};
