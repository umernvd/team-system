import { useAuth0 } from '@auth0/auth0-react'

const PERMISSION_MAP = {
  admin:   ['read', 'create', 'update', 'delete'],
  manager: ['read', 'update'],
  editor:  ['read', 'create', 'update'],
  viewer:  ['read'],
}

export function usePermissions() {
  const { user, isLoading } = useAuth0()
  const role = user?.['https://team-roster-api/role'] || 'viewer'
  const permissions = PERMISSION_MAP[role] || PERMISSION_MAP.viewer

  return {
    role,
    can: (action) => permissions.includes(action),
    isLoading,
  }
}
