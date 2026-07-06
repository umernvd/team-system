function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        req.user = {
            id: req.session.userId,
            username: req.session.username,
            role: req.session.role
        };
        return next();
    }
    res.status(401).json({ error: 'Unauthorized - please login' });
}

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

module.exports = { isAuthenticated, roleCheck };
