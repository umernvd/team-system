module.exports = async ({ event, data }) => {
    console.log(`Webhook received: event=${event}`, JSON.stringify(data, null, 2));
    return { received: true, event, data };
};
