const AppError = require('../utils/AppError');

module.exports = (requiredRole) => {
    return (req, res, next) => {
        if (!req.session || !req.session.userId) {
            return next(new AppError('Not authenticated', 401));
        }
        if (req.user.role !== requiredRole) {
            return next(new AppError('Insufficient permissions', 403));
        }
        next();
    };
};
