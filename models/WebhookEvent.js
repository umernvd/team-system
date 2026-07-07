const mongoose = require('mongoose');

const webhookEventSchema = new mongoose.Schema({
    eventId: { type: String, required: true, unique: true },
    eventType: { type: String, required: true },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ['received', 'processed', 'failed'], default: 'received' }
}, { timestamps: true });

module.exports = mongoose.model('WebhookEvent', webhookEventSchema);
