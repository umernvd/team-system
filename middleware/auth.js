const jwt = require('jsonwebtoken');
const { ACCESS_TOKEN_SECRET } = require('../config');

// verify access token from Authorization header
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token missing' });
    }

    // Verify token
    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        // Attach user info to request
        req.user = {
            id: decoded.userId,
            username: decoded.username,
            role: decoded.role
        };
        next();
    });
}

// check if user has required role
function roleCheck(requiredRole) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        if (req.user.role !== requiredRole) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
}

module.exports = { authenticateToken, roleCheck };