function validateRefreshToken(body) {
  const errors = [];
  if (!body || !body.refreshToken || typeof body.refreshToken !== 'string' || !body.refreshToken.trim()) {
    errors.push('Refresh token is required');
  }
  return errors;
}

module.exports = { validateRefreshToken };
