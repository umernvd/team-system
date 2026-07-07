const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');
const validate = require('../middlewares/validate');
const webhookSignature = require('../middlewares/webhookSignature');
const { validateWebhook } = require('../validators/webhookValidator');

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'test-webhook-secret';

router.post(
  '/test',
  webhookSignature(WEBHOOK_SECRET),
  validate(validateWebhook),
  webhookController.test
);

module.exports = router;
