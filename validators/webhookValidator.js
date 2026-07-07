function validateWebhook(body) {
  const errors = [];
  if (!body || typeof body !== 'object') {
    return ['Request body is required'];
  }
  if (!body.event || typeof body.event !== 'string' || !body.event.trim()) {
    errors.push('Event type is required');
  }
  if (body.data === undefined || body.data === null) {
    errors.push('Data field is required');
  }
  return errors;
}

module.exports = { validateWebhook };
