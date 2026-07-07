const AppError = require('../utils/AppError');

module.exports = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    next(new AppError('Unauthorized - please login', 401));
};
