function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const errors = err.errors || [];
  console.error(`[ERROR] ${statusCode} - ${message}`);
  if (statusCode === 500) console.error(err.stack);
  res.status(statusCode).json({
    success: false,
    message,
    errors
  });
}

module.exports = errorHandler;
