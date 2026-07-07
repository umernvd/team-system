const webhookService = require('../services/webhookService');
const { success } = require('../utils/response');

exports.handleWebhook = async (req, res, next) => {
    try {
        const result = await webhookService.processEvent(req.body);
        success(res, result, 'Webhook processed successfully');
    } catch (err) {
        next(err);
    }
};
