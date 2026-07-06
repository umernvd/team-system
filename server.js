const express = require('express');
const connectDB = require('./db');
const Employee = require('./models/Employee');
const employeeRoutes = require('./routes/employee');
const authRoutes = require('./routes/auth');
const { authenticateToken, roleCheck } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Serve the API test client
app.use(express.static('public'));

connectDB();

// Public auth routes
app.use('/auth', authRoutes);

// Protected employee routes – require valid access token
app.use('/employees', authenticateToken, employeeRoutes);

// Example admin-only route
app.get('/admin-only', authenticateToken, roleCheck('admin'), (req, res) => {
    res.json({ message: 'Welcome, admin! This is a protected admin-only endpoint.' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});