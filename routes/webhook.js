const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');
const webhookSignature = require('../middlewares/webhookSignature');
const validate = require('../middlewares/validate');
const { validateWebhook } = require('../validators/webhookValidator');

router.post('/test', webhookSignature, validate(validateWebhook), webhookController.handleWebhook);

module.exports = router;
