const authService = require('../services/authService');
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
        req.logIn(user, (err) => {
            if (err) return next(err);
            success(res, {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                user: { id: user._id, username: user.username, role: user.role }
            }, 'Login successful');
        });
    } catch (err) {
        next(err);
    }
};

exports.logout = (req, res, next) => {
    try {
        req.logout((err) => {
            if (err) return next(err);
            const result = authService.logout();
            success(res, null, result.message);
        });
    } catch (err) {
        next(err);
    }
};

exports.refresh = (req, res, next) => {
    try {
        if (!req.isAuthenticated()) {
            return next(new (require('../utils/AppError'))('Not authenticated', 401));
        }
        const tokens = authService.refresh(req.user);
        success(res, tokens, 'Token refreshed successfully');
    } catch (err) {
        next(err);
    }
};
