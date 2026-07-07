const mongoose = require('mongoose');
const webhookEventSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  event: { type: String, required: true },
  payload: { type: mongoose.Schema.Types.Mixed },
  processedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('WebhookEvent', webhookEventSchema);
