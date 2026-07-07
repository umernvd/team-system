const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');
const webhookSignature = require('../middlewares/webhookSignature');
router.post('/test', webhookSignature, webhookController.testWebhook);
module.exports = router;
