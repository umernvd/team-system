const express = require('express');
const mongoose = require('mongoose');
const employeeRoutes = require('./routes/employee');
const authRoutes = require('./routes/auth');
const { authenticateToken, roleCheck } = require('./middleware/auth');
const passport = require('./config/passport');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/teamRosterDB';

app.use(express.json());

app.use(passport.initialize());

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/auth', authRoutes);

app.use('/employees', authenticateToken, employeeRoutes);

app.get('/admin-only', authenticateToken, roleCheck('admin'), (req, res) => {
  res.json({ message: 'Welcome admin!' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
