const AppError = require('../utils/AppError');
function validate(validatorFn) {
  return (req, res, next) => {
    const errors = validatorFn(req.body);
    if (errors.length > 0) return next(new AppError('Validation failed', 400, errors));
    next();
  };
}
module.exports = validate;
