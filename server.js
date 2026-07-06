const express = require('express');
const connectDB = require('./db');
const Employee = require('./models/Employee');
const employeeRoutes = require('./routes/employee');
const authRoutes = require('./routes/auth');
const basicAuth = require('./middleware/basicAuth');
const roleCheck = require('./middleware/roleCheck');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve the API test client
app.use(express.static('public'));

connectDB();

// Auth routes
app.use('/auth', authRoutes);

// Protect all employee routes with Basic Auth
app.use('/employees', basicAuth, employeeRoutes);

// Example admin-only route
app.get('/admin-only', basicAuth, roleCheck('admin'), (req, res) => {
    res.json({ message: 'Welcome, admin! This is a protected admin route.' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});