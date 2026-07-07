const webhookService = require('../services/webhookService');
const { success } = require('../utils/response');

exports.test = async (req, res, next) => {
  try {
    const result = await webhookService.processTest(req.body);
    success(res, result, 'Webhook processed successfully');
  } catch (err) {
    next(err);
  }
};
