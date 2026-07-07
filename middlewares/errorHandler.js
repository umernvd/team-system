function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';
  const errors = err.isOperational ? err.errors : [];
  console.error(`[ERROR] ${err.message}`);
  res.status(statusCode).json({ success: false, message, errors });
}
module.exports = errorHandler;
