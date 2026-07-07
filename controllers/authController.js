const passport = require('passport');
const authService = require('../services/authService');
const AppError = require('../utils/AppError');
const { success } = require('../utils/response');

exports.register = async (req, res, next) => {
    try {
        const user = await authService.register(req.body);
        success(res, user, 'User registered');
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

exports.oauthCallback = (req, res, next) => {
    passport.authenticate('google', { session: false }, async (err, user, info) => {
        if (err) return next(err);
        if (!user) return next(new AppError('Google authentication failed', 401));
        try {
            const result = await authService.oauthCallback(user);
            success(res, result, 'OAuth login successful');
        } catch (err) {
            next(err);
        }
    })(req, res, next);
};

exports.refresh = async (req, res, next) => {
    try {
        const result = await authService.refresh(req.body.refreshToken);
        success(res, result, 'Token refreshed successfully');
    } catch (err) {
        next(err);
    }
};

exports.logout = async (req, res, next) => {
    try {
        const result = await authService.logout(req.body.refreshToken);
        success(res, null, result.message);
    } catch (err) {
        next(err);
    }
};
