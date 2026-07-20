const { auth } = require('express-oauth2-jwt-bearer');
const AppError = require('../utils/AppError');

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN || 'your-tenant.auth0.com';
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE || 'https://team-roster-api';

const checkJwt = auth({
  audience: AUTH0_AUDIENCE,
  issuerBaseURL: `https://${AUTH0_DOMAIN}/`,
  tokenSigningAlg: 'RS256'
});

function handleAuthError(err, req, res, next) {
  if (err.statusCode === 401) {
    return next(new AppError(err.message, 401));
  }
  next(err);
}

function setUser(req, res, next) {
  if (req.auth && req.auth.payload) {
    const payload = req.auth.payload;
    req.user = {
      id: payload.sub,
      username: payload.nickname || payload.email || 'unknown',
      role: (payload['https://team-roster-api/role']) || 'viewer'
    };
  }
  next();
}

module.exports = [checkJwt, handleAuthError, setUser];
