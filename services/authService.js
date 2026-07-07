const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const refreshTokenRepository = require('../repositories/refreshTokenRepository');
const AppError = require('../utils/AppError');

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS, 10) || 10;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your-access-secret-change-me';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-change-me';
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

function generateTokens(user) {
    const payload = { userId: user._id, username: user.username, role: user.role };
    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshToken = jwt.sign({ userId: user._id }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
    return { accessToken, refreshToken };
}

async function saveRefreshToken(userId, token) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await refreshTokenRepository.create({ token, userId, expiresAt });
}

exports.register = async ({ username, password, role }) => {
    const existing = await userRepository.findByUsername(username);
    if (existing) {
        throw new AppError('Username taken', 400);
    }
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userRepository.create({ username, password: hashedPassword, role: role || 'user' });
    return { id: user._id, username: user.username, role: user.role };
};

exports.login = async ({ username, password }) => {
    const user = await userRepository.findByUsername(username);
    if (!user) {
        throw new AppError('Invalid credentials', 401);
    }
    if (!user.password) {
        throw new AppError('Account uses Google login', 401);
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        throw new AppError('Invalid credentials', 401);
    }
    const tokens = generateTokens(user);
    await saveRefreshToken(user._id, tokens.refreshToken);
    return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: { id: user._id, username: user.username, role: user.role }
    };
};

exports.oauthCallback = async (user) => {
    const tokens = generateTokens(user);
    await saveRefreshToken(user._id, tokens.refreshToken);
    return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: { id: user._id, username: user.username, role: user.role }
    };
};

exports.refresh = async (refreshToken) => {
    const storedToken = await refreshTokenRepository.findByToken(refreshToken);
    if (!storedToken) {
        throw new AppError('Invalid refresh token', 403);
    }
    let decoded;
    try {
        decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    } catch (err) {
        await refreshTokenRepository.deleteByToken(refreshToken);
        throw new AppError('Invalid refresh token', 403);
    }
    const user = await userRepository.findById(decoded.userId);
    if (!user) {
        throw new AppError('User not found', 403);
    }
    await refreshTokenRepository.deleteByToken(refreshToken);
    const tokens = generateTokens(user);
    await saveRefreshToken(user._id, tokens.refreshToken);
    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
};

exports.logout = async (refreshToken) => {
    await refreshTokenRepository.deleteByToken(refreshToken);
    return { message: 'Logged out successfully' };
};
