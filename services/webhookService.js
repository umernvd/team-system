const webhookEventRepository = require('../repositories/webhookEventRepository');
const testWebhook = require('../webhooks/test');
const AppError = require('../utils/AppError');

exports.processTest = async (payload) => {
  const { event, data } = payload;
  const eventId = payload.eventId || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const existing = await webhookEventRepository.findByEventId(eventId);
  if (existing) {
    throw new AppError('Duplicate webhook event', 409, [`Event ${eventId} already processed`]);
  }

  const result = await testWebhook.process({ event, data });

  await webhookEventRepository.create({
    eventId,
    eventType: event,
    payload: data,
    status: 'processed'
  });

  return { eventId, result };
};
