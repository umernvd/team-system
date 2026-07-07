exports.validateWebhook = (req) => {
    const errors = [];
    const { event, data } = req.body;
    if (!event || typeof event !== 'string' || !event.trim()) {
        errors.push('event is required');
    }
    if (data === undefined || data === null) {
        errors.push('data is required');
    }
    return errors;
};
