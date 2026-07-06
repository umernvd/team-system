const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
    SALT_ROUNDS,
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY
} = require('../config');

// generate tokens for a user
function generateTokens(user) {
    const payload = { userId: user._id, username: user.username, role: user.role };
    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshToken = jwt.sign(
        { userId: user._id },
        REFRESH_TOKEN_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
    return { accessToken, refreshToken };
}

// Register new user
exports.register = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const user = new User({
            username,
            password: hashedPassword,
            role: role || 'user'
        });

        await user.save();

        res.status(201).json({
            message: 'User registered successfully',
            user: { id: user._id, username: user.username, role: user.role }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Username already taken' });
        }
        res.status(500).json({ error: error.message });
    }
};

// Login 
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user);

        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); 
        await RefreshToken.create({
            token: refreshToken,
            userId: user._id,
            expiresAt
        });

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

// Refresh access token using a valid refresh token
exports.refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token required' });
        }

        // Check if token exists in database and is not expired
        const storedToken = await RefreshToken.findOne({ token: refreshToken });
        if (!storedToken) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }

        // Verify the refresh token signature
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
        } catch (err) {
            // Token expired or malformed – remove it from DB
            await RefreshToken.deleteOne({ token: refreshToken });
            return res.status(403).json({ error: 'Invalid refresh token' });
        }

        // Find the user
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(403).json({ error: 'User not found' });
        }

        await RefreshToken.deleteOne({ token: refreshToken });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user);

        // Save the new refresh token
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await RefreshToken.create({
            token: newRefreshToken,
            userId: user._id,
            expiresAt
        });

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Logout – delete refresh token from database
exports.logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token required' });
        }

        await RefreshToken.deleteOne({ token: refreshToken });
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};