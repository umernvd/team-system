const webhookEventRepository = require('../repositories/webhookEventRepository');
const AppError = require('../utils/AppError');
async function processTestEvent(eventId, payload) {
  const existing = await webhookEventRepository.findByEventId(eventId);
  if (existing) throw new AppError('Duplicate webhook event', 409);
  await webhookEventRepository.create({ eventId, event: payload.event, payload });
  return { message: 'Webhook processed successfully', eventId };
}
module.exports = { processTestEvent };
