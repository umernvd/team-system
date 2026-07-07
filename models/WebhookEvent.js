const mongoose = require('mongoose');

const webhookEventSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  eventType: { type: String, required: true },
  payload: { type: mongoose.Schema.Types.Mixed, required: true },
  status: { type: String, enum: ['processed', 'failed'], default: 'processed' }
}, { timestamps: true });

module.exports = mongoose.model('WebhookEvent', webhookEventSchema);
