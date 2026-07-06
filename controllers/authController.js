const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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
        if (error.code === 11000) return res.status(400).json({ error: 'Username already taken' });
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }
        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Invalid credentials' });

        req.session.userId = user._id;
        req.session.username = user.username;
        req.session.role = user.role;

        const { accessToken, refreshToken } = generateTokens(user);
        res.json({
            message: 'Login successful',
            accessToken,
            refreshToken,
            user: { id: user._id, username: user.username, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: 'Could not log out' });
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
    });
};

exports.refresh = (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    const user = {
        _id: req.session.userId,
        username: req.session.username,
        role: req.session.role
    };
    const { accessToken, refreshToken } = generateTokens(user);
    res.json({ accessToken, refreshToken });
};
