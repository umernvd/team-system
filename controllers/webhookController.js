const webhookService = require('../services/webhookService');
const { success, error } = require('../utils/response');
async function testWebhook(req, res, next) {
  try {
    const result = await webhookService.processTestEvent(req.webhookEventId, req.body);
    return success(res, result, 'Webhook processed', 200);
  } catch (err) {
    next(err);
  }
}
module.exports = { testWebhook };
