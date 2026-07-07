const User = require('../models/User');
const bcrypt = require('bcrypt');
const AppError = require('../utils/AppError');

async function basicAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return next(new AppError('Authorization header missing or invalid', 401));
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  if (!username || !password) {
    return next(new AppError('Invalid credentials format', 401));
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return next(new AppError('Invalid credentials', 401));
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return next(new AppError('Invalid credentials', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    next(new AppError(error.message, 500));
  }
}

module.exports = basicAuth;
