const crypto = require('crypto');
const AppError = require('../utils/AppError');

function webhookSignature(secret) {
  return (req, res, next) => {
    const signature = req.headers['x-webhook-signature'];
    if (!signature) {
      return next(new AppError('Webhook signature header missing', 401));
    }

    const computed = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== computed) {
      return next(new AppError('Invalid webhook signature', 401));
    }

    next();
  };
}

module.exports = webhookSignature;
