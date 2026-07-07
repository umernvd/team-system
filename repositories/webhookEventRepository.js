const WebhookEvent = require('../models/WebhookEvent');
async function findByEventId(eventId) { return WebhookEvent.findOne({ eventId }); }
async function create(data) { return new WebhookEvent(data).save(); }
module.exports = { findByEventId, create };
