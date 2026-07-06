const express = require('express');
const connectDB = require('./db');
const Employee = require('./models/Employee');
const employeeRoutes = require('./routes/employee');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON bodies
app.use(express.json());

connectDB();

app.use('/employees', employeeRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});