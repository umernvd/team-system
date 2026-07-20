import { Link } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { usePermissions } from '../hooks/usePermissions'

export default function Navbar() {
  const { loginWithRedirect, logout, isAuthenticated, user, isLoading } = useAuth0()
  const { role } = usePermissions()

  return (
    <nav className="bg-white shadow-sm border-b px-6 py-3 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-gray-800 no-underline">
        Team Roster
      </Link>

      <div className="flex items-center gap-4">
        {isLoading ? (
          <span className="text-sm text-gray-400">Loading...</span>
        ) : isAuthenticated ? (
          <>
            <Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <Link to="/profile" className="text-sm text-gray-600 hover:text-gray-900">
              Profile
            </Link>
            <span className="text-xs bg-blue-700 text-blue-100 px-2 py-1 rounded font-medium uppercase">
              {role}
            </span>
            <span className="text-sm text-gray-400">|</span>
            <span className="text-sm text-gray-700">{user?.name || user?.email}</span>
            <button
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => loginWithRedirect()}
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-white-700"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  )
}
