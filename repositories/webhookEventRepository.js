const WebhookEvent = require('../models/WebhookEvent');

exports.create = async (data) => {
  const event = new WebhookEvent(data);
  return event.save();
};

exports.findByEventId = async (eventId) => {
  return WebhookEvent.findOne({ eventId });
};
