const mongoose = require('mongoose');

function validateCreate(body) {
  const errors = [];
  if (!body || typeof body !== 'object') {
    return ['Request body is required'];
  }
  if (Array.isArray(body)) {
    for (let i = 0; i < body.length; i++) {
      const emp = body[i];
      if (!emp || !emp.name || !emp.role || !emp.department) {
        errors.push(`Employee at index ${i} must have name, role, and department`);
      }
    }
    return errors;
  }
  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    errors.push('Name is required');
  }
  if (!body.role || typeof body.role !== 'string' || !body.role.trim()) {
    errors.push('Role is required');
  }
  if (!body.department || typeof body.department !== 'string' || !body.department.trim()) {
    errors.push('Department is required');
  }
  return errors;
}

function validateUpdate(body, params) {
  const errors = [];
  if (!params || !params.id) {
    errors.push('Employee ID is required');
  } else if (!mongoose.Types.ObjectId.isValid(params.id)) {
    errors.push('Invalid employee ID format');
  }
  if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
    errors.push('Request body must contain at least one field to update');
  }
  return errors;
}

function validateDelete(params) {
  const errors = [];
  if (!params || !params.id) {
    errors.push('Employee ID is required');
  } else if (!mongoose.Types.ObjectId.isValid(params.id)) {
    errors.push('Invalid employee ID format');
  }
  return errors;
}

module.exports = { validateCreate, validateUpdate, validateDelete };
