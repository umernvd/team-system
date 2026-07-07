const AppError = require('../utils/AppError');

module.exports = (err, req, res, next) => {
    console.error(err.stack);
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors
        });
    }
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: messages
        });
    }
    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'Duplicate key error',
            errors: ['Resource already exists']
        });
    }
    res.status(500).json({
        success: false,
        message: err.message || 'Internal server error',
        errors: []
    });
};
