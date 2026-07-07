const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your-access-secret-change-me';

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return next(new AppError('Access token missing', 401));
    }
    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return next(new AppError('Invalid or expired token', 403));
        }
        req.user = {
            id: decoded.userId,
            username: decoded.username,
            role: decoded.role
        };
        next();
    });
};
