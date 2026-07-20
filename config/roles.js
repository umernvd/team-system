const ROLES = {
  admin:   { level: 4, label: 'Admin' },
  manager: { level: 3, label: 'Manager' },
  editor:  { level: 2, label: 'Editor' },
  viewer:  { level: 1, label: 'Viewer' },
};

const PERMISSIONS = {
  'employees:read':   ['admin', 'manager', 'editor', 'viewer'],
  'employees:create': ['admin', 'editor'],
  'employees:update': ['admin', 'manager'],
  'employees:delete': ['admin'],
};

module.exports = { ROLES, PERMISSIONS };
