const crypto = require('crypto');
const AppError = require('../utils/AppError');

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'test-webhook-secret';

module.exports = (req, res, next) => {
    const signature = req.headers['x-webhook-signature'];
    if (!signature) {
        return next(new AppError('Missing webhook signature', 401));
    }
    const payload = JSON.stringify(req.body);
    const expected = crypto.createHmac('sha256', WEBHOOK_SECRET).update(payload).digest('hex');
    if (signature !== expected) {
        return next(new AppError('Invalid webhook signature', 401));
    }
    next();
};
