const express = require('express');
const connectDB = require('./db');
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employee');
const webhookRoutes = require('./routes/webhook');
const requestLogger = require('./middlewares/requestLogger');
const basicAuth = require('./middlewares/basicAuth');
const roleCheck = require('./middlewares/roleCheck');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const { success } = require('./utils/response');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static('public'));
app.use(requestLogger);

connectDB();

app.use('/auth', authRoutes);
app.use('/employees', employeeRoutes);
app.use('/webhooks', webhookRoutes);

app.get('/admin-only', basicAuth, roleCheck('admin'), (req, res) => {
  success(res, null, 'Welcome, admin! This is a protected admin route.');
});

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
