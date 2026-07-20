const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const audience = import.meta.env.VITE_AUTH0_AUDIENCE || 'https://team-roster-api';

if (!domain || !clientId) {
  console.error('Missing VITE_AUTH0_DOMAIN or VITE_AUTH0_CLIENT_ID in .env file');
}

export { domain, clientId, audience };
