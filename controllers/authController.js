const authService = require('../services/authService');
const { success } = require('../utils/response');

exports.register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    success(res, result, 'User registered successfully', 201);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    success(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const result = await authService.refresh(req.body);
    success(res, result, 'Token refreshed successfully');
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const result = await authService.logout(req.body);
    success(res, result, 'Logout successful');
  } catch (err) {
    next(err);
  }
};
