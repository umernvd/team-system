const expressBasicAuth = require('express-basic-auth');
const User = require('../models/User');
const bcrypt = require('bcrypt');

// returns true if credentials are valid
const authorizer = async (username, password) => {
    try {
        const user = await User.findOne({ username });
        if (!user) return false;

        const match = await bcrypt.compare(password, user.password);
        if (match) {
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
};

// runs after successful auth and allows to attach the user
const challenge = (req, res) => {
    res.status(401).json({ error: 'Unauthorized – invalid credentials' });
};

// actual middleware used in routes
const basicAuth = expressBasicAuth({
    authorizer,
    challenge,
    unauthorizedResponse: 'Unauthorized'  // fallback message
});

const manualBasicAuth = async (req, res, next) => {
    // Check for Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ error: 'Authorization header missing or invalid' });
    }

    // Decode base64 credentials
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    if (!username || !password) {
        return res.status(401).json({ error: 'Invalid credentials format' });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // attach the user to `req.user`
        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = manualBasicAuth;