const webhookEventRepository = require('../repositories/webhookEventRepository');
const AppError = require('../utils/AppError');

exports.processEvent = async (eventData) => {
    const { eventId, event, data } = eventData;
    const existing = await webhookEventRepository.findByEventId(eventId);
    if (existing) {
        throw new AppError('Duplicate webhook event', 409);
    }
    const processor = require('../webhooks/test');
    const result = await processor({ event, data });
    await webhookEventRepository.create({
        eventId,
        eventType: event,
        payload: data,
        status: 'processed'
    });
    return result;
};
