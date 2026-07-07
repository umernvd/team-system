const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('./config/passport');

const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employee');
const webhookRoutes = require('./routes/webhook');

const requestLogger = require('./middlewares/requestLogger');
const isAuthenticated = require('./middlewares/isAuthenticated');
const roleCheck = require('./middlewares/roleCheck');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const { success } = require('./utils/response');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/teamRosterDB';

app.use(express.json());
app.use(express.static('public'));
app.use(requestLogger);

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret-change-me',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGO_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use('/auth', authRoutes);
app.use('/employees', employeeRoutes);
app.use('/webhooks', webhookRoutes);

app.get('/admin-only', isAuthenticated, roleCheck('admin'), (req, res) => {
    success(res, { message: 'Welcome admin!' });
});

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
});
