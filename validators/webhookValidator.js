function validateWebhookPayload(data) {
  const errors = [];
  if (!data || typeof data !== 'object') errors.push('Payload is required');
  if (!data.event || typeof data.event !== 'string') errors.push('event is required');
  return errors;
}
module.exports = { validateWebhookPayload };
