const AppError = require('../utils/AppError');

module.exports = (req, res, next) => {
    if (req.session && req.session.userId) {
        req.user = {
            id: req.session.userId,
            username: req.session.username,
            role: req.session.role
        };
        return next();
    }
    next(new AppError('Unauthorized - please login', 401));
};
