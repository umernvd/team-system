function validateCreate(data) {
  const errors = [];
  if (!data || typeof data !== 'object') { errors.push('Request body is required'); return errors; }
  if (Array.isArray(data)) {
    data.forEach((item, i) => {
      if (!item.name || !item.role || !item.department) errors.push(`Employee ${i}: name, role, and department are required`);
    });
  } else {
    if (!data.name || typeof data.name !== 'string' || !data.name.trim()) errors.push('Name is required');
    if (!data.role || typeof data.role !== 'string' || !data.role.trim()) errors.push('Role is required');
    if (!data.department || typeof data.department !== 'string' || !data.department.trim()) errors.push('Department is required');
  }
  return errors;
}
function validateUpdate(data) {
  const errors = [];
  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) { errors.push('Request body is required'); return errors; }
  return errors;
}
module.exports = { validateCreate, validateUpdate };
