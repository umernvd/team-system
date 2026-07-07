const express = require('express');
const mongoose = require('mongoose');
const passport = require('./config/passport');

const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employee');
const webhookRoutes = require('./routes/webhook');

const requestLogger = require('./middlewares/requestLogger');
const authenticateToken = require('./middlewares/authenticateToken');
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

app.use(passport.initialize());

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/auth', authRoutes);
app.use('/employees', employeeRoutes);
app.use('/webhooks', webhookRoutes);

app.get('/admin-only', authenticateToken, roleCheck('admin'), (req, res) => {
  success(res, { message: 'Welcome admin!' });
});

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
