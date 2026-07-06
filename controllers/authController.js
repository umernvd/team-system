const User = require('../models/User');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

// create a new user with hashed password
exports.register = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const user = new User({
            username,
            password: hashedPassword,
            role: role || 'user'   
        });

        await user.save();

        // return user data without password
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        // duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Username already taken' });
        }
        res.status(500).json({ error: error.message });
    }
};

// LOGIN – verify credentials and return user info (no token, just validation)
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

        // compare provided password with stored hash
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// LOGOUT – stateless
exports.logout = (req, res) => {
    // No server-side session to destroy; client should discard credentials.
    res.json({ message: 'Logout successful – please discard your stored credentials' });
};