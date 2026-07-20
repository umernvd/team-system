const { PERMISSIONS } = require('../config/roles');
const AppError = require('../utils/AppError');

function checkPermission(requiredPermission) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }
    const allowedRoles = PERMISSIONS[requiredPermission];
    if (!allowedRoles) {
      return next(new AppError(`Unknown permission: ${requiredPermission}`, 500));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }
    next();
  };
}

module.exports = checkPermission;
