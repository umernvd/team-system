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
        const { user, tokens } = await authService.login(req.body);
        req.session.userId = user._id;
        req.session.username = user.username;
        req.session.role = user.role;
        success(res, {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: { id: user._id, username: user.username, role: user.role }
        }, 'Login successful');
    } catch (err) {
        next(err);
    }
};

exports.logout = (req, res, next) => {
    try {
        req.session.destroy((err) => {
            if (err) return next(err);
            res.clearCookie('connect.sid');
            success(res, null, 'Logged out successfully');
        });
    } catch (err) {
        next(err);
    }
};

exports.refresh = (req, res, next) => {
    try {
        if (!req.session || !req.session.userId) {
            return next(new AppError('Not authenticated', 401));
        }
        const user = {
            _id: req.session.userId,
            username: req.session.username,
            role: req.session.role
        };
        const tokens = authService.refresh(user);
        success(res, tokens, 'Token refreshed successfully');
    } catch (err) {
        next(err);
    }
};
