exports.process = async ({ event, data }) => {
  console.log(`[WEBHOOK] Processing event: ${event}`);
  return { received: true, event, data };
};
