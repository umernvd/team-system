const crypto = require('crypto');
const AppError = require('../utils/AppError');
function webhookSignature(req, res, next) {
  const secret = process.env.WEBHOOK_SECRET || 'test-webhook-secret';
  const signature = req.headers['x-webhook-signature'];
  const eventId = req.headers['x-webhook-event-id'];
  if (!signature) return next(new AppError('Missing x-webhook-signature header', 401));
  if (!eventId) return next(new AppError('Missing x-webhook-event-id header', 401));
  const rawBody = JSON.stringify(req.body);
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  if (signature !== expected) return next(new AppError('Invalid webhook signature', 401));
  req.webhookEventId = eventId;
  next();
}
module.exports = webhookSignature;
