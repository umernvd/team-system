const AppError = require('../utils/AppError');

function roleCheck(requiredRole) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }
    if (req.user.role !== requiredRole) {
      return next(new AppError('Insufficient permissions', 403));
    }
    next();
  };
}

module.exports = roleCheck;
