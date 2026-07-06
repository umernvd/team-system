const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const {
    SALT_ROUNDS,
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY
} = require('../config');

function generateTokens(user) {
    const payload = { userId: user._id, username: user.username, role: user.role };
    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshToken = jwt.sign({ userId: user._id }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
    return { accessToken, refreshToken };
}

exports.register = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const user = new User({ username, password: hashedPassword, role: role || 'user' });
        await user.save();
        res.status(201).json({
            message: 'User registered',
            user: { id: user._id, username: user.username, role: user.role }
        });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ error: 'Username taken' });
        res.status(500).json({ error: error.message });
    }
};

exports.login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return res.status(401).json({ error: info.message || 'Invalid credentials' });
        }
        req.logIn(user, (loginErr) => {
            if (loginErr) return next(loginErr);
            const { accessToken, refreshToken } = generateTokens(user);
            res.json({
                message: 'Login successful',
                accessToken,
                refreshToken,
                user: { id: user._id, username: user.username, role: user.role }
            });
        });
    })(req, res, next);
};

exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Logged out successfully' });
    });
};

exports.refresh = (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    const user = req.user;
    const { accessToken, refreshToken } = generateTokens(user);
    res.json({ accessToken, refreshToken });
};
