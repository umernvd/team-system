const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const employeeRoutes = require('./routes/employee');
const authRoutes = require('./routes/auth');
const { isAuthenticated, roleCheck } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/teamRosterDB';

app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'session-secret-change-me',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGO_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use('/auth', authRoutes);

app.use('/employees', employeeRoutes);

app.get('/admin-only', isAuthenticated, roleCheck('admin'), (req, res) => {
    res.json({ message: 'Welcome admin! This is a protected admin route.' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
