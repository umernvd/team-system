function validateRegister(body) {
  const errors = [];
  if (!body || !body.username || typeof body.username !== 'string' || !body.username.trim()) {
    errors.push('Username is required');
  }
  if (!body || !body.password || typeof body.password !== 'string') {
    errors.push('Password is required');
  } else if (body.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  if (body && body.role && !['user', 'admin'].includes(body.role)) {
    errors.push('Role must be user or admin');
  }
  return errors;
}

function validateLogin(body) {
  const errors = [];
  if (!body || !body.username || typeof body.username !== 'string' || !body.username.trim()) {
    errors.push('Username is required');
  }
  if (!body || !body.password || typeof body.password !== 'string' || !body.password.trim()) {
    errors.push('Password is required');
  }
  return errors;
}

module.exports = { validateRegister, validateLogin };
