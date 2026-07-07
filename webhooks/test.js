function processWebhook(payload) {
  console.log('Webhook received:', JSON.stringify(payload, null, 2));
  return { processed: true };
}
module.exports = { processWebhook };
