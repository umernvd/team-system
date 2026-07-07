const AppError = require('../utils/AppError');

module.exports = (validatorFn) => {
    return (req, res, next) => {
        const errors = validatorFn(req);
        if (errors.length > 0) {
            return next(new AppError('Validation failed', 400, errors));
        }
        next();
    };
};
