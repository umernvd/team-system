const roleCheck = (requiredRole) => {
    return (req, res, next) => {
        
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized – not authenticated' });
        }

        const userRole = req.user.role;

        if (userRole !== requiredRole) {
            return res.status(403).json({ error: 'Forbidden – insufficient role' });
        }

        next();
    };
};

module.exports = roleCheck;